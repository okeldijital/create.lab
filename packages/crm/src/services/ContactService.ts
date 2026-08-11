import {
  Contact,
  type CreateContactProps,
} from "../aggregates/Contact/Contact.js";
import {
  ContactNotFoundError,
  CustomerNotFoundError,
} from "../errors/CRMErrors.js";
import { PrimaryContactChanged } from "../events/crm-events.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ContactPolicy } from "../policies/ContactPolicy.js";
import { CustomerLifecyclePolicy } from "../policies/CustomerLifecyclePolicy.js";
import type { ContactRepository } from "../repositories/ContactRepository.js";
import type { CustomerRepository } from "../repositories/CustomerRepository.js";
import type { ContactId, CustomerId } from "../types/ids.js";

export type ContactServiceDeps = {
  contactRepository: ContactRepository;
  customerRepository: CustomerRepository;
  eventPublisher: DomainEventPublisher;
};

export class ContactService {
  constructor(private readonly deps: ContactServiceDeps) {}

  async add(props: CreateContactProps): Promise<Contact> {
    const customer = await this.deps.customerRepository.findById(
      props.customerId,
    );
    if (!customer) throw new CustomerNotFoundError(props.customerId);
    CustomerLifecyclePolicy.assertMutable(customer);

    const existing = await this.deps.contactRepository.findByCustomer(
      props.customerId,
    );
    const wantPrimary = props.isPrimary === true;
    ContactPolicy.assertSinglePrimary(
      props.customerId,
      existing,
      wantPrimary,
    );
    ContactPolicy.assertUniqueEmail(
      props.customerId,
      props.email,
      existing,
    );

    const contact = Contact.create(props);
    await this.deps.contactRepository.save(contact);
    await this.deps.eventPublisher.publish(contact.pullDomainEvents());
    return contact;
  }

  async setPrimary(contactId: ContactId, now?: Date): Promise<Contact> {
    const contact = await this.getById(contactId);
    CustomerLifecyclePolicy.assertMutable(
      (await this.deps.customerRepository.findById(contact.customerId)) ??
        (() => {
          throw new CustomerNotFoundError(contact.customerId);
        })(),
    );

    const existing = await this.deps.contactRepository.findByCustomer(
      contact.customerId,
    );
    const previous = existing.find((c) => c.isPrimary && c.id !== contact.id);
    if (previous) {
      previous.clearPrimary(now);
      await this.deps.contactRepository.update(previous);
    }
    contact.markPrimary(now);
    await this.deps.contactRepository.update(contact);

    const event = PrimaryContactChanged.create({
      organizationId: contact.organizationId,
      customerId: contact.customerId,
      contactId: contact.id,
      previousContactId: previous?.id ?? null,
      occurredAt: now,
    });
    await this.deps.eventPublisher.publish([
      event,
      ...contact.pullDomainEvents(),
    ]);
    return contact;
  }

  async archive(id: ContactId, now?: Date): Promise<Contact> {
    const contact = await this.getById(id);
    contact.archive(now);
    await this.deps.contactRepository.archive(id);
    await this.deps.contactRepository.update(contact);
    await this.deps.eventPublisher.publish(contact.pullDomainEvents());
    return contact;
  }

  async getById(id: ContactId): Promise<Contact> {
    const contact = await this.deps.contactRepository.findById(id);
    if (!contact) throw new ContactNotFoundError(id);
    return contact;
  }

  async listByCustomer(customerId: CustomerId): Promise<Contact[]> {
    return this.deps.contactRepository.findByCustomer(customerId);
  }

  async getPrimary(customerId: CustomerId): Promise<Contact | null> {
    return this.deps.contactRepository.findPrimaryContact(customerId);
  }
}
