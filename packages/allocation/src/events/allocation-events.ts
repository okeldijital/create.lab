import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { AllocationStatus } from "../enums/AllocationStatus.js";
import type { ResourceType } from "../enums/ResourceType.js";
import type { ReservationStatus } from "../enums/ReservationStatus.js";
import type {
  AllocationGroupId,
  AllocationId,
  ReservationId,
} from "../types/ids.js";

export class AllocationCreated extends DomainEvent<
  "AllocationCreated",
  Readonly<{
    allocationId: string;
    resourceId: string;
    resourceType: ResourceType;
    projectId: string;
    workOrderId: string;
    status: AllocationStatus;
    percentage: number;
  }>
> {
  static create(input: {
    organizationId: string;
    allocationId: AllocationId;
    resourceId: string;
    resourceType: ResourceType;
    projectId: string;
    workOrderId: string;
    status: AllocationStatus;
    percentage: number;
    occurredAt?: Date;
  }): AllocationCreated {
    return new AllocationCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "AllocationCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.allocationId,
      organizationId: input.organizationId,
      payload: {
        allocationId: input.allocationId,
        resourceId: input.resourceId,
        resourceType: input.resourceType,
        projectId: input.projectId,
        workOrderId: input.workOrderId,
        status: input.status,
        percentage: input.percentage,
      },
    });
  }
}

export class AllocationUpdated extends DomainEvent<
  "AllocationUpdated",
  Readonly<{ allocationId: string }>
> {
  static create(input: {
    organizationId: string;
    allocationId: AllocationId;
    occurredAt?: Date;
  }): AllocationUpdated {
    return new AllocationUpdated({
      eventId: DomainEvent.nextEventId(),
      eventType: "AllocationUpdated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.allocationId,
      organizationId: input.organizationId,
      payload: { allocationId: input.allocationId },
    });
  }
}

export class AllocationActivated extends DomainEvent<
  "AllocationActivated",
  Readonly<{ allocationId: string }>
> {
  static create(input: {
    organizationId: string;
    allocationId: AllocationId;
    occurredAt?: Date;
  }): AllocationActivated {
    return new AllocationActivated({
      eventId: DomainEvent.nextEventId(),
      eventType: "AllocationActivated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.allocationId,
      organizationId: input.organizationId,
      payload: { allocationId: input.allocationId },
    });
  }
}

export class AllocationCompleted extends DomainEvent<
  "AllocationCompleted",
  Readonly<{ allocationId: string }>
> {
  static create(input: {
    organizationId: string;
    allocationId: AllocationId;
    occurredAt?: Date;
  }): AllocationCompleted {
    return new AllocationCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "AllocationCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.allocationId,
      organizationId: input.organizationId,
      payload: { allocationId: input.allocationId },
    });
  }
}

export class AllocationCancelled extends DomainEvent<
  "AllocationCancelled",
  Readonly<{ allocationId: string }>
> {
  static create(input: {
    organizationId: string;
    allocationId: AllocationId;
    occurredAt?: Date;
  }): AllocationCancelled {
    return new AllocationCancelled({
      eventId: DomainEvent.nextEventId(),
      eventType: "AllocationCancelled",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.allocationId,
      organizationId: input.organizationId,
      payload: { allocationId: input.allocationId },
    });
  }
}

export class AllocationArchived extends DomainEvent<
  "AllocationArchived",
  Readonly<{ allocationId: string }>
> {
  static create(input: {
    organizationId: string;
    allocationId: AllocationId;
    occurredAt?: Date;
  }): AllocationArchived {
    return new AllocationArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "AllocationArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.allocationId,
      organizationId: input.organizationId,
      payload: { allocationId: input.allocationId },
    });
  }
}

export class AllocationGroupCreated extends DomainEvent<
  "AllocationGroupCreated",
  Readonly<{ groupId: string; name: string }>
> {
  static create(input: {
    organizationId: string;
    groupId: AllocationGroupId;
    name: string;
    occurredAt?: Date;
  }): AllocationGroupCreated {
    return new AllocationGroupCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "AllocationGroupCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.groupId,
      organizationId: input.organizationId,
      payload: { groupId: input.groupId, name: input.name },
    });
  }
}

export class AllocationGroupArchived extends DomainEvent<
  "AllocationGroupArchived",
  Readonly<{ groupId: string }>
> {
  static create(input: {
    organizationId: string;
    groupId: AllocationGroupId;
    occurredAt?: Date;
  }): AllocationGroupArchived {
    return new AllocationGroupArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "AllocationGroupArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.groupId,
      organizationId: input.organizationId,
      payload: { groupId: input.groupId },
    });
  }
}

export class ReservationRequested extends DomainEvent<
  "ReservationRequested",
  Readonly<{
    reservationId: string;
    resourceId: string;
    projectId: string;
    status: ReservationStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    reservationId: ReservationId;
    resourceId: string;
    projectId: string;
    status: ReservationStatus;
    occurredAt?: Date;
  }): ReservationRequested {
    return new ReservationRequested({
      eventId: DomainEvent.nextEventId(),
      eventType: "ReservationRequested",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.reservationId,
      organizationId: input.organizationId,
      payload: {
        reservationId: input.reservationId,
        resourceId: input.resourceId,
        projectId: input.projectId,
        status: input.status,
      },
    });
  }
}

export class ReservationApproved extends DomainEvent<
  "ReservationApproved",
  Readonly<{ reservationId: string }>
> {
  static create(input: {
    organizationId: string;
    reservationId: ReservationId;
    occurredAt?: Date;
  }): ReservationApproved {
    return new ReservationApproved({
      eventId: DomainEvent.nextEventId(),
      eventType: "ReservationApproved",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.reservationId,
      organizationId: input.organizationId,
      payload: { reservationId: input.reservationId },
    });
  }
}

export class ReservationCancelled extends DomainEvent<
  "ReservationCancelled",
  Readonly<{ reservationId: string }>
> {
  static create(input: {
    organizationId: string;
    reservationId: ReservationId;
    occurredAt?: Date;
  }): ReservationCancelled {
    return new ReservationCancelled({
      eventId: DomainEvent.nextEventId(),
      eventType: "ReservationCancelled",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.reservationId,
      organizationId: input.organizationId,
      payload: { reservationId: input.reservationId },
    });
  }
}

export class ReservationConverted extends DomainEvent<
  "ReservationConverted",
  Readonly<{ reservationId: string; allocationId: string }>
> {
  static create(input: {
    organizationId: string;
    reservationId: ReservationId;
    allocationId: AllocationId;
    occurredAt?: Date;
  }): ReservationConverted {
    return new ReservationConverted({
      eventId: DomainEvent.nextEventId(),
      eventType: "ReservationConverted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.reservationId,
      organizationId: input.organizationId,
      payload: {
        reservationId: input.reservationId,
        allocationId: input.allocationId,
      },
    });
  }
}
