import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { OrganizationId } from "../types/ids.js";
import type { OrganizationStatus } from "../enums/OrganizationStatus.js";

type OrgCreatedPayload = Readonly<{
  name: string;
  displayName: string;
  slug: string;
  status: OrganizationStatus;
}>;

export class OrganizationCreated extends DomainEvent<
  "OrganizationCreated",
  OrgCreatedPayload
> {
  static create(input: {
    organizationId: OrganizationId;
    name: string;
    displayName: string;
    slug: string;
    status: OrganizationStatus;
    occurredAt?: Date;
  }): OrganizationCreated {
    return new OrganizationCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "OrganizationCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.organizationId,
      organizationId: input.organizationId,
      payload: {
        name: input.name,
        displayName: input.displayName,
        slug: input.slug,
        status: input.status,
      },
    });
  }
}

type OrgUpdatedPayload = Readonly<{
  name: string;
  displayName: string;
  legalName: string;
  description: string | null;
  timezone: string;
  locale: string;
  currency: string;
  status: OrganizationStatus;
}>;

export class OrganizationUpdated extends DomainEvent<
  "OrganizationUpdated",
  OrgUpdatedPayload
> {
  static create(input: {
    organizationId: OrganizationId;
    name: string;
    displayName: string;
    legalName: string;
    description: string | null;
    timezone: string;
    locale: string;
    currency: string;
    status: OrganizationStatus;
    occurredAt?: Date;
  }): OrganizationUpdated {
    return new OrganizationUpdated({
      eventId: DomainEvent.nextEventId(),
      eventType: "OrganizationUpdated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.organizationId,
      organizationId: input.organizationId,
      payload: {
        name: input.name,
        displayName: input.displayName,
        legalName: input.legalName,
        description: input.description,
        timezone: input.timezone,
        locale: input.locale,
        currency: input.currency,
        status: input.status,
      },
    });
  }
}

type OrgArchivedPayload = Readonly<{
  archivedAt: string;
}>;

export class OrganizationArchived extends DomainEvent<
  "OrganizationArchived",
  OrgArchivedPayload
> {
  static create(input: {
    organizationId: OrganizationId;
    archivedAt: Date;
    occurredAt?: Date;
  }): OrganizationArchived {
    return new OrganizationArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "OrganizationArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.organizationId,
      organizationId: input.organizationId,
      payload: {
        archivedAt: input.archivedAt.toISOString(),
      },
    });
  }
}
