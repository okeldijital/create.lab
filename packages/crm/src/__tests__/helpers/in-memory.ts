import type { AnyDomainEvent } from "@creative-lab/core";
import type {
  Organization,
  OrganizationId,
  OrganizationRepository,
  OrganizationSlug,
} from "@creative-lab/organization";
import type { Contact } from "../../aggregates/Contact/Contact.js";
import type { Customer } from "../../aggregates/Customer/Customer.js";
import type { Interaction } from "../../aggregates/Interaction/Interaction.js";
import type { Opportunity } from "../../aggregates/Opportunity/Opportunity.js";
import type { CustomerStatus } from "../../enums/CustomerStatus.js";
import type { OpportunityStatus } from "../../enums/OpportunityStatus.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { ContactRepository } from "../../repositories/ContactRepository.js";
import type { CustomerRepository } from "../../repositories/CustomerRepository.js";
import type { InteractionRepository } from "../../repositories/InteractionRepository.js";
import type { OpportunityRepository } from "../../repositories/OpportunityRepository.js";
import type {
  ContactId,
  CustomerId,
  InteractionId,
  OpportunityId,
} from "../../types/ids.js";

export class InMemoryEventPublisher implements DomainEventPublisher {
  readonly events: AnyDomainEvent[] = [];
  async publish(events: readonly AnyDomainEvent[]): Promise<void> {
    this.events.push(...events);
  }
}

export class InMemoryOrganizationRepository implements OrganizationRepository {
  private readonly byId = new Map<string, Organization>();
  async findById(id: OrganizationId): Promise<Organization | null> {
    return this.byId.get(id) ?? null;
  }
  async findBySlug(
    slug: OrganizationSlug | string,
  ): Promise<Organization | null> {
    const v = typeof slug === "string" ? slug : slug.value;
    for (const o of this.byId.values()) {
      if (o.slug.value === v) return o;
    }
    return null;
  }
  async findAll(): Promise<Organization[]> {
    return [...this.byId.values()];
  }
  async save(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async update(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async archive(id: OrganizationId): Promise<void> {
    void id;
  }
  async exists(id: OrganizationId): Promise<boolean> {
    return this.byId.has(id);
  }
  async existsBySlug(slug: OrganizationSlug | string): Promise<boolean> {
    return (await this.findBySlug(slug)) !== null;
  }
  async delete(id: OrganizationId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryCustomerRepository implements CustomerRepository {
  private readonly byId = new Map<string, Customer>();

  async findById(id: CustomerId): Promise<Customer | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Customer[]> {
    return [...this.byId.values()].filter(
      (c) => c.organizationId === organizationId,
    );
  }
  async findByStatus(status: CustomerStatus): Promise<Customer[]> {
    return [...this.byId.values()].filter((c) => c.status === status);
  }
  async findByCustomerNumber(
    organizationId: OrganizationId,
    customerNumber: string,
  ): Promise<Customer | null> {
    return (
      [...this.byId.values()].find(
        (c) =>
          c.organizationId === organizationId &&
          c.customerNumber.value === customerNumber,
      ) ?? null
    );
  }
  async save(customer: Customer): Promise<void> {
    this.byId.set(customer.id, customer);
  }
  async update(customer: Customer): Promise<void> {
    this.byId.set(customer.id, customer);
  }
  async archive(id: CustomerId): Promise<void> {
    void id;
  }
  async exists(id: CustomerId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryContactRepository implements ContactRepository {
  private readonly byId = new Map<string, Contact>();

  async findById(id: ContactId): Promise<Contact | null> {
    return this.byId.get(id) ?? null;
  }
  async findByCustomer(customerId: CustomerId): Promise<Contact[]> {
    return [...this.byId.values()].filter((c) => c.customerId === customerId);
  }
  async findPrimaryContact(customerId: CustomerId): Promise<Contact | null> {
    return (
      [...this.byId.values()].find(
        (c) => c.customerId === customerId && c.isPrimary && !c.isArchived,
      ) ?? null
    );
  }
  async save(contact: Contact): Promise<void> {
    this.byId.set(contact.id, contact);
  }
  async update(contact: Contact): Promise<void> {
    this.byId.set(contact.id, contact);
  }
  async archive(id: ContactId): Promise<void> {
    void id;
  }
  async exists(id: ContactId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryOpportunityRepository implements OpportunityRepository {
  private readonly byId = new Map<string, Opportunity>();

  async findById(id: OpportunityId): Promise<Opportunity | null> {
    return this.byId.get(id) ?? null;
  }
  async findByCustomer(customerId: CustomerId): Promise<Opportunity[]> {
    return [...this.byId.values()].filter((o) => o.customerId === customerId);
  }
  async findByStatus(status: OpportunityStatus): Promise<Opportunity[]> {
    return [...this.byId.values()].filter((o) => o.status === status);
  }
  async save(opportunity: Opportunity): Promise<void> {
    this.byId.set(opportunity.id, opportunity);
  }
  async update(opportunity: Opportunity): Promise<void> {
    this.byId.set(opportunity.id, opportunity);
  }
  async archive(id: OpportunityId): Promise<void> {
    void id;
  }
  async exists(id: OpportunityId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryInteractionRepository implements InteractionRepository {
  private readonly byId = new Map<string, Interaction>();

  async findById(id: InteractionId): Promise<Interaction | null> {
    return this.byId.get(id) ?? null;
  }
  async findByCustomer(customerId: CustomerId): Promise<Interaction[]> {
    return [...this.byId.values()].filter((i) => i.customerId === customerId);
  }
  async save(interaction: Interaction): Promise<void> {
    this.byId.set(interaction.id, interaction);
  }
  async exists(id: InteractionId): Promise<boolean> {
    return this.byId.has(id);
  }
}
