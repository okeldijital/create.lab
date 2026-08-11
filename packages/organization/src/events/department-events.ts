import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { DepartmentId, OrganizationId } from "../types/ids.js";
import type { DepartmentStatus } from "../enums/DepartmentStatus.js";

type DeptCreatedPayload = Readonly<{
  departmentId: string;
  name: string;
  parentDepartmentId: string | null;
  status: DepartmentStatus;
}>;

export class DepartmentCreated extends DomainEvent<
  "DepartmentCreated",
  DeptCreatedPayload
> {
  static create(input: {
    organizationId: OrganizationId;
    departmentId: DepartmentId;
    name: string;
    parentDepartmentId: DepartmentId | null;
    status: DepartmentStatus;
    occurredAt?: Date;
  }): DepartmentCreated {
    return new DepartmentCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "DepartmentCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.departmentId,
      organizationId: input.organizationId,
      payload: {
        departmentId: input.departmentId,
        name: input.name,
        parentDepartmentId: input.parentDepartmentId,
        status: input.status,
      },
    });
  }
}

type DeptUpdatedPayload = Readonly<{
  departmentId: string;
  name: string;
  description: string | null;
  parentDepartmentId: string | null;
  status: DepartmentStatus;
}>;

export class DepartmentUpdated extends DomainEvent<
  "DepartmentUpdated",
  DeptUpdatedPayload
> {
  static create(input: {
    organizationId: OrganizationId;
    departmentId: DepartmentId;
    name: string;
    description: string | null;
    parentDepartmentId: DepartmentId | null;
    status: DepartmentStatus;
    occurredAt?: Date;
  }): DepartmentUpdated {
    return new DepartmentUpdated({
      eventId: DomainEvent.nextEventId(),
      eventType: "DepartmentUpdated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.departmentId,
      organizationId: input.organizationId,
      payload: {
        departmentId: input.departmentId,
        name: input.name,
        description: input.description,
        parentDepartmentId: input.parentDepartmentId,
        status: input.status,
      },
    });
  }
}

type DeptArchivedPayload = Readonly<{
  departmentId: string;
}>;

export class DepartmentArchived extends DomainEvent<
  "DepartmentArchived",
  DeptArchivedPayload
> {
  static create(input: {
    organizationId: OrganizationId;
    departmentId: DepartmentId;
    occurredAt?: Date;
  }): DepartmentArchived {
    return new DepartmentArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "DepartmentArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.departmentId,
      organizationId: input.organizationId,
      payload: {
        departmentId: input.departmentId,
      },
    });
  }
}
