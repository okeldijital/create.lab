import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { CustomerStatus } from "../enums/CustomerStatus.js";
import type { OpportunityStatus } from "../enums/OpportunityStatus.js";
import type { InteractionType } from "../enums/InteractionType.js";
import type {
  ContactId,
  CustomerId,
  InteractionId,
  OpportunityId,
} from "../types/ids.js";

export class CustomerCreated extends DomainEvent<
  "CustomerCreated",
  Readonly<{
    customerId: string;
    customerNumber: string;
    name: string;
    status: CustomerStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    customerId: CustomerId;
    customerNumber: string;
    name: string;
    status: CustomerStatus;
    occurredAt?: Date;
  }): CustomerCreated {
    return new CustomerCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "CustomerCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.customerId,
      organizationId: input.organizationId,
      payload: {
        customerId: input.customerId,
        customerNumber: input.customerNumber,
        name: input.name,
        status: input.status,
      },
    });
  }
}

export class CustomerActivated extends DomainEvent<
  "CustomerActivated",
  Readonly<{ customerId: string }>
> {
  static create(input: {
    organizationId: string;
    customerId: CustomerId;
    occurredAt?: Date;
  }): CustomerActivated {
    return new CustomerActivated({
      eventId: DomainEvent.nextEventId(),
      eventType: "CustomerActivated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.customerId,
      organizationId: input.organizationId,
      payload: { customerId: input.customerId },
    });
  }
}

export class CustomerArchived extends DomainEvent<
  "CustomerArchived",
  Readonly<{ customerId: string }>
> {
  static create(input: {
    organizationId: string;
    customerId: CustomerId;
    occurredAt?: Date;
  }): CustomerArchived {
    return new CustomerArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "CustomerArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.customerId,
      organizationId: input.organizationId,
      payload: { customerId: input.customerId },
    });
  }
}

export class ContactAdded extends DomainEvent<
  "ContactAdded",
  Readonly<{
    contactId: string;
    customerId: string;
    email: string;
    isPrimary: boolean;
  }>
> {
  static create(input: {
    organizationId: string;
    contactId: ContactId;
    customerId: CustomerId;
    email: string;
    isPrimary: boolean;
    occurredAt?: Date;
  }): ContactAdded {
    return new ContactAdded({
      eventId: DomainEvent.nextEventId(),
      eventType: "ContactAdded",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.contactId,
      organizationId: input.organizationId,
      payload: {
        contactId: input.contactId,
        customerId: input.customerId,
        email: input.email,
        isPrimary: input.isPrimary,
      },
    });
  }
}

export class PrimaryContactChanged extends DomainEvent<
  "PrimaryContactChanged",
  Readonly<{
    customerId: string;
    contactId: string;
    previousContactId: string | null;
  }>
> {
  static create(input: {
    organizationId: string;
    customerId: CustomerId;
    contactId: ContactId;
    previousContactId: ContactId | null;
    occurredAt?: Date;
  }): PrimaryContactChanged {
    return new PrimaryContactChanged({
      eventId: DomainEvent.nextEventId(),
      eventType: "PrimaryContactChanged",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.customerId,
      organizationId: input.organizationId,
      payload: {
        customerId: input.customerId,
        contactId: input.contactId,
        previousContactId: input.previousContactId,
      },
    });
  }
}

export class OpportunityCreated extends DomainEvent<
  "OpportunityCreated",
  Readonly<{
    opportunityId: string;
    customerId: string;
    title: string;
    status: OpportunityStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    opportunityId: OpportunityId;
    customerId: CustomerId;
    title: string;
    status: OpportunityStatus;
    occurredAt?: Date;
  }): OpportunityCreated {
    return new OpportunityCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "OpportunityCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.opportunityId,
      organizationId: input.organizationId,
      payload: {
        opportunityId: input.opportunityId,
        customerId: input.customerId,
        title: input.title,
        status: input.status,
      },
    });
  }
}

export class OpportunityWon extends DomainEvent<
  "OpportunityWon",
  Readonly<{ opportunityId: string; customerId: string }>
> {
  static create(input: {
    organizationId: string;
    opportunityId: OpportunityId;
    customerId: CustomerId;
    occurredAt?: Date;
  }): OpportunityWon {
    return new OpportunityWon({
      eventId: DomainEvent.nextEventId(),
      eventType: "OpportunityWon",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.opportunityId,
      organizationId: input.organizationId,
      payload: {
        opportunityId: input.opportunityId,
        customerId: input.customerId,
      },
    });
  }
}

export class OpportunityLost extends DomainEvent<
  "OpportunityLost",
  Readonly<{ opportunityId: string; customerId: string }>
> {
  static create(input: {
    organizationId: string;
    opportunityId: OpportunityId;
    customerId: CustomerId;
    occurredAt?: Date;
  }): OpportunityLost {
    return new OpportunityLost({
      eventId: DomainEvent.nextEventId(),
      eventType: "OpportunityLost",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.opportunityId,
      organizationId: input.organizationId,
      payload: {
        opportunityId: input.opportunityId,
        customerId: input.customerId,
      },
    });
  }
}

export class OpportunityArchived extends DomainEvent<
  "OpportunityArchived",
  Readonly<{ opportunityId: string }>
> {
  static create(input: {
    organizationId: string;
    opportunityId: OpportunityId;
    occurredAt?: Date;
  }): OpportunityArchived {
    return new OpportunityArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "OpportunityArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.opportunityId,
      organizationId: input.organizationId,
      payload: { opportunityId: input.opportunityId },
    });
  }
}

export class InteractionRecorded extends DomainEvent<
  "InteractionRecorded",
  Readonly<{
    interactionId: string;
    customerId: string;
    contactId: string | null;
    type: InteractionType;
  }>
> {
  static create(input: {
    organizationId: string;
    interactionId: InteractionId;
    customerId: CustomerId;
    contactId: ContactId | null;
    type: InteractionType;
    occurredAt?: Date;
  }): InteractionRecorded {
    return new InteractionRecorded({
      eventId: DomainEvent.nextEventId(),
      eventType: "InteractionRecorded",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.interactionId,
      organizationId: input.organizationId,
      payload: {
        interactionId: input.interactionId,
        customerId: input.customerId,
        contactId: input.contactId,
        type: input.type,
      },
    });
  }
}
