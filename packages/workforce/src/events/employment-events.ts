import type { OrganizationId } from "@creative-lab/organization";
import type { EmploymentStatus } from "../enums/EmploymentStatus.js";
import type { EmploymentType } from "../enums/EmploymentType.js";
import type { EmploymentId, WorkerId } from "../types/ids.js";
import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";

export class EmploymentStarted extends DomainEvent<
  "EmploymentStarted",
  Readonly<{
    employmentId: string;
    workerId: string;
    employmentType: EmploymentType;
    startDate: string;
    status: EmploymentStatus;
  }>
> {
  static create(input: {
    organizationId: OrganizationId;
    employmentId: EmploymentId;
    workerId: WorkerId;
    employmentType: EmploymentType;
    startDate: Date;
    status: EmploymentStatus;
    occurredAt?: Date;
  }): EmploymentStarted {
    return new EmploymentStarted({
      eventId: DomainEvent.nextEventId(),
      eventType: "EmploymentStarted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.employmentId,
      organizationId: input.organizationId,
      payload: {
        employmentId: input.employmentId,
        workerId: input.workerId,
        employmentType: input.employmentType,
        startDate: input.startDate.toISOString(),
        status: input.status,
      },
    });
  }
}

export class EmploymentUpdated extends DomainEvent<
  "EmploymentUpdated",
  Readonly<{
    employmentId: string;
    workerId: string;
    status: EmploymentStatus;
    endDate: string | null;
  }>
> {
  static create(input: {
    organizationId: OrganizationId;
    employmentId: EmploymentId;
    workerId: WorkerId;
    status: EmploymentStatus;
    endDate: Date | null;
    occurredAt?: Date;
  }): EmploymentUpdated {
    return new EmploymentUpdated({
      eventId: DomainEvent.nextEventId(),
      eventType: "EmploymentUpdated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.employmentId,
      organizationId: input.organizationId,
      payload: {
        employmentId: input.employmentId,
        workerId: input.workerId,
        status: input.status,
        endDate: input.endDate?.toISOString() ?? null,
      },
    });
  }
}

export class EmploymentEnded extends DomainEvent<
  "EmploymentEnded",
  Readonly<{
    employmentId: string;
    workerId: string;
    endDate: string;
    status: EmploymentStatus;
  }>
> {
  static create(input: {
    organizationId: OrganizationId;
    employmentId: EmploymentId;
    workerId: WorkerId;
    endDate: Date;
    status: EmploymentStatus;
    occurredAt?: Date;
  }): EmploymentEnded {
    return new EmploymentEnded({
      eventId: DomainEvent.nextEventId(),
      eventType: "EmploymentEnded",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.employmentId,
      organizationId: input.organizationId,
      payload: {
        employmentId: input.employmentId,
        workerId: input.workerId,
        endDate: input.endDate.toISOString(),
        status: input.status,
      },
    });
  }
}
