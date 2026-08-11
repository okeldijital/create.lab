import {
  DomainEvent,
  DOMAIN_EVENT_VERSION,
} from "@creative-lab/core";
import type { CapacityStatus } from "../enums/CapacityStatus.js";
import type { ResourceType } from "../enums/ResourceType.js";
import type { CapacityUnit } from "../enums/CapacityUnit.js";
import type { CapabilityLevel } from "../enums/CapabilityLevel.js";
import type {
  AvailabilityProfileId,
  CapabilityId,
  CapacityProfileId,
  ResourceCapacityId,
  ResourceId,
  WorkingPatternId,
} from "../types/ids.js";

export class CapacityProfileCreated extends DomainEvent<
  "CapacityProfileCreated",
  Readonly<{
    capacityProfileId: string;
    resourceId: string;
    resourceType: ResourceType;
    status: CapacityStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    capacityProfileId: CapacityProfileId;
    resourceId: ResourceId;
    resourceType: ResourceType;
    status: CapacityStatus;
    occurredAt?: Date;
  }): CapacityProfileCreated {
    return new CapacityProfileCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "CapacityProfileCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.capacityProfileId,
      organizationId: input.organizationId,
      payload: {
        capacityProfileId: input.capacityProfileId,
        resourceId: input.resourceId,
        resourceType: input.resourceType,
        status: input.status,
      },
    });
  }
}

export class CapacityProfileUpdated extends DomainEvent<
  "CapacityProfileUpdated",
  Readonly<{
    capacityProfileId: string;
    status: CapacityStatus;
    availabilityProfileId: string | null;
    workingPatternId: string | null;
  }>
> {
  static create(input: {
    organizationId: string;
    capacityProfileId: CapacityProfileId;
    status: CapacityStatus;
    availabilityProfileId: AvailabilityProfileId | null;
    workingPatternId: WorkingPatternId | null;
    occurredAt?: Date;
  }): CapacityProfileUpdated {
    return new CapacityProfileUpdated({
      eventId: DomainEvent.nextEventId(),
      eventType: "CapacityProfileUpdated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.capacityProfileId,
      organizationId: input.organizationId,
      payload: {
        capacityProfileId: input.capacityProfileId,
        status: input.status,
        availabilityProfileId: input.availabilityProfileId,
        workingPatternId: input.workingPatternId,
      },
    });
  }
}

export class CapacityProfileArchived extends DomainEvent<
  "CapacityProfileArchived",
  Readonly<{ capacityProfileId: string }>
> {
  static create(input: {
    organizationId: string;
    capacityProfileId: CapacityProfileId;
    occurredAt?: Date;
  }): CapacityProfileArchived {
    return new CapacityProfileArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "CapacityProfileArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.capacityProfileId,
      organizationId: input.organizationId,
      payload: { capacityProfileId: input.capacityProfileId },
    });
  }
}

export class CapabilityAdded extends DomainEvent<
  "CapabilityAdded",
  Readonly<{
    capabilityId: string;
    capacityProfileId: string;
    name: string;
    proficiency: CapabilityLevel;
  }>
> {
  static create(input: {
    organizationId: string;
    capabilityId: CapabilityId;
    capacityProfileId: CapacityProfileId;
    name: string;
    proficiency: CapabilityLevel;
    occurredAt?: Date;
  }): CapabilityAdded {
    return new CapabilityAdded({
      eventId: DomainEvent.nextEventId(),
      eventType: "CapabilityAdded",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.capabilityId,
      organizationId: input.organizationId,
      payload: {
        capabilityId: input.capabilityId,
        capacityProfileId: input.capacityProfileId,
        name: input.name,
        proficiency: input.proficiency,
      },
    });
  }
}

export class CapabilityRemoved extends DomainEvent<
  "CapabilityRemoved",
  Readonly<{ capabilityId: string; capacityProfileId: string }>
> {
  static create(input: {
    organizationId: string;
    capabilityId: CapabilityId;
    capacityProfileId: CapacityProfileId;
    occurredAt?: Date;
  }): CapabilityRemoved {
    return new CapabilityRemoved({
      eventId: DomainEvent.nextEventId(),
      eventType: "CapabilityRemoved",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.capabilityId,
      organizationId: input.organizationId,
      payload: {
        capabilityId: input.capabilityId,
        capacityProfileId: input.capacityProfileId,
      },
    });
  }
}

export class AvailabilityProfileCreated extends DomainEvent<
  "AvailabilityProfileCreated",
  Readonly<{ availabilityProfileId: string; name: string }>
> {
  static create(input: {
    organizationId: string;
    availabilityProfileId: AvailabilityProfileId;
    name: string;
    occurredAt?: Date;
  }): AvailabilityProfileCreated {
    return new AvailabilityProfileCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "AvailabilityProfileCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.availabilityProfileId,
      organizationId: input.organizationId,
      payload: {
        availabilityProfileId: input.availabilityProfileId,
        name: input.name,
      },
    });
  }
}

export class AvailabilityProfileUpdated extends DomainEvent<
  "AvailabilityProfileUpdated",
  Readonly<{
    availabilityProfileId: string;
    name: string;
    timezone: string;
  }>
> {
  static create(input: {
    organizationId: string;
    availabilityProfileId: AvailabilityProfileId;
    name: string;
    timezone: string;
    occurredAt?: Date;
  }): AvailabilityProfileUpdated {
    return new AvailabilityProfileUpdated({
      eventId: DomainEvent.nextEventId(),
      eventType: "AvailabilityProfileUpdated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.availabilityProfileId,
      organizationId: input.organizationId,
      payload: {
        availabilityProfileId: input.availabilityProfileId,
        name: input.name,
        timezone: input.timezone,
      },
    });
  }
}

export class WorkingPatternCreated extends DomainEvent<
  "WorkingPatternCreated",
  Readonly<{
    workingPatternId: string;
    hoursPerWeek: number;
    daysPerWeek: number;
  }>
> {
  static create(input: {
    organizationId: string;
    workingPatternId: WorkingPatternId;
    hoursPerWeek: number;
    daysPerWeek: number;
    occurredAt?: Date;
  }): WorkingPatternCreated {
    return new WorkingPatternCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "WorkingPatternCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.workingPatternId,
      organizationId: input.organizationId,
      payload: {
        workingPatternId: input.workingPatternId,
        hoursPerWeek: input.hoursPerWeek,
        daysPerWeek: input.daysPerWeek,
      },
    });
  }
}

export class WorkingPatternUpdated extends DomainEvent<
  "WorkingPatternUpdated",
  Readonly<{
    workingPatternId: string;
    hoursPerWeek: number;
    hoursPerDay: number;
    daysPerWeek: number;
  }>
> {
  static create(input: {
    organizationId: string;
    workingPatternId: WorkingPatternId;
    hoursPerWeek: number;
    hoursPerDay: number;
    daysPerWeek: number;
    occurredAt?: Date;
  }): WorkingPatternUpdated {
    return new WorkingPatternUpdated({
      eventId: DomainEvent.nextEventId(),
      eventType: "WorkingPatternUpdated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.workingPatternId,
      organizationId: input.organizationId,
      payload: {
        workingPatternId: input.workingPatternId,
        hoursPerWeek: input.hoursPerWeek,
        hoursPerDay: input.hoursPerDay,
        daysPerWeek: input.daysPerWeek,
      },
    });
  }
}

export class ResourceCapacityUpdated extends DomainEvent<
  "ResourceCapacityUpdated",
  Readonly<{
    resourceCapacityId: string;
    capacityProfileId: string;
    quantity: number;
    unit: CapacityUnit;
  }>
> {
  static create(input: {
    organizationId: string;
    resourceCapacityId: ResourceCapacityId;
    capacityProfileId: CapacityProfileId;
    quantity: number;
    unit: CapacityUnit;
    occurredAt?: Date;
  }): ResourceCapacityUpdated {
    return new ResourceCapacityUpdated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ResourceCapacityUpdated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.resourceCapacityId,
      organizationId: input.organizationId,
      payload: {
        resourceCapacityId: input.resourceCapacityId,
        capacityProfileId: input.capacityProfileId,
        quantity: input.quantity,
        unit: input.unit,
      },
    });
  }
}
