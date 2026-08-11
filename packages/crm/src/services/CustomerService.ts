import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import {
  Customer,
  type CreateCustomerProps,
} from "../aggregates/Customer/Customer.js";
import { CustomerStatus } from "../enums/CustomerStatus.js";
import {
  CustomerNotFoundError,
  DuplicateCustomerNumberError,
} from "../errors/CRMErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { CustomerLifecyclePolicy } from "../policies/CustomerLifecyclePolicy.js";
import type { CustomerRepository } from "../repositories/CustomerRepository.js";
import type { CustomerId } from "../types/ids.js";
import { CustomerNumber } from "../value-objects/CustomerNumber.js";

export type CustomerServiceDeps = {
  customerRepository: CustomerRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class CustomerService {
  constructor(private readonly deps: CustomerServiceDeps) {}

  async create(props: CreateCustomerProps): Promise<Customer> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }

    const numberValue = props.customerNumber
      ? CustomerNumber.create(props.customerNumber).value
      : null;

    // Generate first if needed so uniqueness check uses final number.
    const customer = Customer.create(props);
    const existing = await this.deps.customerRepository.findByCustomerNumber(
      props.organizationId,
      customer.customerNumber.value,
    );
    if (existing) {
      throw new DuplicateCustomerNumberError(
        customer.customerNumber.value,
        props.organizationId,
      );
    }
    // numberValue unused except for clarity when client supplies explicit number
    void numberValue;

    await this.deps.customerRepository.save(customer);
    await this.deps.eventPublisher.publish(customer.pullDomainEvents());
    return customer;
  }

  async promoteToProspect(id: CustomerId, now?: Date): Promise<Customer> {
    const customer = await this.getById(id);
    CustomerLifecyclePolicy.assertCanTransition(
      customer,
      CustomerStatus.PROSPECT,
    );
    customer.promoteToProspect(now);
    await this.deps.customerRepository.update(customer);
    await this.deps.eventPublisher.publish(customer.pullDomainEvents());
    return customer;
  }

  async activate(id: CustomerId, now?: Date): Promise<Customer> {
    const customer = await this.getById(id);
    CustomerLifecyclePolicy.assertCanTransition(
      customer,
      CustomerStatus.ACTIVE,
    );
    customer.activate(now);
    await this.deps.customerRepository.update(customer);
    await this.deps.eventPublisher.publish(customer.pullDomainEvents());
    return customer;
  }

  async deactivate(id: CustomerId, now?: Date): Promise<Customer> {
    const customer = await this.getById(id);
    CustomerLifecyclePolicy.assertCanTransition(
      customer,
      CustomerStatus.INACTIVE,
    );
    customer.deactivate(now);
    await this.deps.customerRepository.update(customer);
    await this.deps.eventPublisher.publish(customer.pullDomainEvents());
    return customer;
  }

  async restore(id: CustomerId, now?: Date): Promise<Customer> {
    const customer = await this.getById(id);
    CustomerLifecyclePolicy.assertCanRestore(customer);
    customer.restore(now);
    await this.deps.customerRepository.update(customer);
    await this.deps.eventPublisher.publish(customer.pullDomainEvents());
    return customer;
  }

  async archive(id: CustomerId, now?: Date): Promise<Customer> {
    const customer = await this.getById(id);
    CustomerLifecyclePolicy.assertCanArchive(customer);
    customer.archive(now);
    await this.deps.customerRepository.archive(id);
    await this.deps.customerRepository.update(customer);
    await this.deps.eventPublisher.publish(customer.pullDomainEvents());
    return customer;
  }

  async getById(id: CustomerId): Promise<Customer> {
    const customer = await this.deps.customerRepository.findById(id);
    if (!customer) throw new CustomerNotFoundError(id);
    return customer;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Customer[]> {
    return this.deps.customerRepository.findByOrganization(organizationId);
  }

  async findByCustomerNumber(
    organizationId: OrganizationId,
    customerNumber: string,
  ): Promise<Customer | null> {
    return this.deps.customerRepository.findByCustomerNumber(
      organizationId,
      customerNumber,
    );
  }
}
