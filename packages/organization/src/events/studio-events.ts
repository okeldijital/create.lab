import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { OrganizationId, StudioId } from "../types/ids.js";
import type { StudioStatus } from "../enums/StudioStatus.js";
import type { StudioType } from "../enums/StudioType.js";

type StudioCreatedPayload = Readonly<{
  studioId: string;
  name: string;
  type: StudioType;
  capacity: number;
  status: StudioStatus;
}>;

export class StudioCreated extends DomainEvent<
  "StudioCreated",
  StudioCreatedPayload
> {
  static create(input: {
    organizationId: OrganizationId;
    studioId: StudioId;
    name: string;
    type: StudioType;
    capacity: number;
    status: StudioStatus;
    occurredAt?: Date;
  }): StudioCreated {
    return new StudioCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "StudioCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.studioId,
      organizationId: input.organizationId,
      payload: {
        studioId: input.studioId,
        name: input.name,
        type: input.type,
        capacity: input.capacity,
        status: input.status,
      },
    });
  }
}

type StudioUpdatedPayload = Readonly<{
  studioId: string;
  name: string;
  description: string | null;
  type: StudioType;
  capacity: number;
  location: string | null;
  status: StudioStatus;
}>;

export class StudioUpdated extends DomainEvent<
  "StudioUpdated",
  StudioUpdatedPayload
> {
  static create(input: {
    organizationId: OrganizationId;
    studioId: StudioId;
    name: string;
    description: string | null;
    type: StudioType;
    capacity: number;
    location: string | null;
    status: StudioStatus;
    occurredAt?: Date;
  }): StudioUpdated {
    return new StudioUpdated({
      eventId: DomainEvent.nextEventId(),
      eventType: "StudioUpdated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.studioId,
      organizationId: input.organizationId,
      payload: {
        studioId: input.studioId,
        name: input.name,
        description: input.description,
        type: input.type,
        capacity: input.capacity,
        location: input.location,
        status: input.status,
      },
    });
  }
}

type StudioArchivedPayload = Readonly<{
  studioId: string;
}>;

export class StudioArchived extends DomainEvent<
  "StudioArchived",
  StudioArchivedPayload
> {
  static create(input: {
    organizationId: OrganizationId;
    studioId: StudioId;
    occurredAt?: Date;
  }): StudioArchived {
    return new StudioArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "StudioArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.studioId,
      organizationId: input.organizationId,
      payload: {
        studioId: input.studioId,
      },
    });
  }
}
