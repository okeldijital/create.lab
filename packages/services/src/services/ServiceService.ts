import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import {
  Service,
  type CreateServiceProps,
} from "../aggregates/Service/Service.js";
import { ServiceStatus } from "../enums/ServiceStatus.js";
import {
  CategoryNotFoundError,
  DuplicateServiceCodeError,
  ServiceNotFoundError,
} from "../errors/ServicesErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ServiceLifecyclePolicy } from "../policies/ServiceLifecyclePolicy.js";
import type { CategoryRepository } from "../repositories/CategoryRepository.js";
import type { ServiceRepository } from "../repositories/ServiceRepository.js";
import type { ServiceId } from "../types/ids.js";
import { ServiceCode } from "../value-objects/ServiceCode.js";

export type ServiceServiceDeps = {
  serviceRepository: ServiceRepository;
  categoryRepository: CategoryRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class ServiceService {
  constructor(private readonly deps: ServiceServiceDeps) {}

  async create(props: CreateServiceProps): Promise<Service> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const category = await this.deps.categoryRepository.findById(
      props.categoryId,
    );
    if (!category || category.isArchived) {
      throw new CategoryNotFoundError(props.categoryId);
    }

    const code = ServiceCode.create(props.serviceCode);
    const existing = await this.deps.serviceRepository.findByServiceCode(
      props.organizationId,
      code.value,
    );
    if (existing) {
      throw new DuplicateServiceCodeError(code.value, props.organizationId);
    }

    const service = Service.create({
      ...props,
      serviceCode: code.value,
    });
    await this.deps.serviceRepository.save(service);
    await this.deps.eventPublisher.publish(service.pullDomainEvents());
    return service;
  }

  async activate(id: ServiceId, now?: Date): Promise<Service> {
    const service = await this.getById(id);
    ServiceLifecyclePolicy.assertCanActivate(service);
    service.activate(now);
    await this.deps.serviceRepository.update(service);
    await this.deps.eventPublisher.publish(service.pullDomainEvents());
    return service;
  }

  async deactivate(id: ServiceId, now?: Date): Promise<Service> {
    const service = await this.getById(id);
    ServiceLifecyclePolicy.assertCanTransition(
      service,
      ServiceStatus.INACTIVE,
    );
    service.deactivate(now);
    await this.deps.serviceRepository.update(service);
    await this.deps.eventPublisher.publish(service.pullDomainEvents());
    return service;
  }

  async archive(id: ServiceId, now?: Date): Promise<Service> {
    const service = await this.getById(id);
    ServiceLifecyclePolicy.assertCanTransition(
      service,
      ServiceStatus.ARCHIVED,
    );
    service.archive(now);
    await this.deps.serviceRepository.archive(id);
    await this.deps.serviceRepository.update(service);
    await this.deps.eventPublisher.publish(service.pullDomainEvents());
    return service;
  }

  async getById(id: ServiceId): Promise<Service> {
    const service = await this.deps.serviceRepository.findById(id);
    if (!service) throw new ServiceNotFoundError(id);
    return service;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Service[]> {
    return this.deps.serviceRepository.findByOrganization(organizationId);
  }

  async findByServiceCode(
    organizationId: OrganizationId,
    serviceCode: string,
  ): Promise<Service | null> {
    return this.deps.serviceRepository.findByServiceCode(
      organizationId,
      ServiceCode.create(serviceCode).value,
    );
  }
}
