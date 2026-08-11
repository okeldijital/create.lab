import type { OrganizationId } from "@creative-lab/organization";
import type { PositionStatus } from "../enums/PositionStatus.js";
import type { PositionId } from "../types/ids.js";
import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";

export class PositionCreated extends DomainEvent<
  "PositionCreated",
  Readonly<{ positionId: string; title: string; status: PositionStatus }>
> {
  static create(input: {
    organizationId: OrganizationId;
    positionId: PositionId;
    title: string;
    status: PositionStatus;
    occurredAt?: Date;
  }): PositionCreated {
    return new PositionCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "PositionCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.positionId,
      organizationId: input.organizationId,
      payload: {
        positionId: input.positionId,
        title: input.title,
        status: input.status,
      },
    });
  }
}

export class PositionUpdated extends DomainEvent<
  "PositionUpdated",
  Readonly<{
    positionId: string;
    title: string;
    description: string | null;
    grade: string | null;
    status: PositionStatus;
  }>
> {
  static create(input: {
    organizationId: OrganizationId;
    positionId: PositionId;
    title: string;
    description: string | null;
    grade: string | null;
    status: PositionStatus;
    occurredAt?: Date;
  }): PositionUpdated {
    return new PositionUpdated({
      eventId: DomainEvent.nextEventId(),
      eventType: "PositionUpdated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.positionId,
      organizationId: input.organizationId,
      payload: {
        positionId: input.positionId,
        title: input.title,
        description: input.description,
        grade: input.grade,
        status: input.status,
      },
    });
  }
}

export class PositionArchived extends DomainEvent<
  "PositionArchived",
  Readonly<{ positionId: string }>
> {
  static create(input: {
    organizationId: OrganizationId;
    positionId: PositionId;
    occurredAt?: Date;
  }): PositionArchived {
    return new PositionArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "PositionArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.positionId,
      organizationId: input.organizationId,
      payload: { positionId: input.positionId },
    });
  }
}
