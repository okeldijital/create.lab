import type { OrganizationId } from "@creative-lab/organization";
import type { WorkerStatus } from "../enums/WorkerStatus.js";
import type { EmploymentType } from "../enums/EmploymentType.js";
import type { WorkerId } from "../types/ids.js";
import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";

export class WorkerCreated extends DomainEvent<
  "WorkerCreated",
  Readonly<{
    workerId: string;
    employeeNumber: string;
    email: string;
    status: WorkerStatus;
    employmentType: EmploymentType;
  }>
> {
  static create(input: {
    organizationId: OrganizationId;
    workerId: WorkerId;
    employeeNumber: string;
    email: string;
    status: WorkerStatus;
    employmentType: EmploymentType;
    occurredAt?: Date;
  }): WorkerCreated {
    return new WorkerCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "WorkerCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.workerId,
      organizationId: input.organizationId,
      payload: {
        workerId: input.workerId,
        employeeNumber: input.employeeNumber,
        email: input.email,
        status: input.status,
        employmentType: input.employmentType,
      },
    });
  }
}

export class WorkerUpdated extends DomainEvent<
  "WorkerUpdated",
  Readonly<{
    workerId: string;
    firstName: string;
    lastName: string;
    email: string;
    status: WorkerStatus;
    departmentId: string;
    teamId: string | null;
    positionId: string | null;
    managerId: string | null;
  }>
> {
  static create(input: {
    organizationId: OrganizationId;
    workerId: WorkerId;
    firstName: string;
    lastName: string;
    email: string;
    status: WorkerStatus;
    departmentId: string;
    teamId: string | null;
    positionId: string | null;
    managerId: string | null;
    occurredAt?: Date;
  }): WorkerUpdated {
    return new WorkerUpdated({
      eventId: DomainEvent.nextEventId(),
      eventType: "WorkerUpdated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.workerId,
      organizationId: input.organizationId,
      payload: {
        workerId: input.workerId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        status: input.status,
        departmentId: input.departmentId,
        teamId: input.teamId,
        positionId: input.positionId,
        managerId: input.managerId,
      },
    });
  }
}

export class WorkerArchived extends DomainEvent<
  "WorkerArchived",
  Readonly<{ workerId: string; archivedAt: string }>
> {
  static create(input: {
    organizationId: OrganizationId;
    workerId: WorkerId;
    archivedAt: Date;
    occurredAt?: Date;
  }): WorkerArchived {
    return new WorkerArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "WorkerArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.workerId,
      organizationId: input.organizationId,
      payload: {
        workerId: input.workerId,
        archivedAt: input.archivedAt.toISOString(),
      },
    });
  }
}
