import type { OrganizationId } from "@creative-lab/organization";
import type { ReportingRelationshipId, WorkerId } from "../types/ids.js";
import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";

export class ManagerAssigned extends DomainEvent<
  "ManagerAssigned",
  Readonly<{ workerId: string; managerId: string; relationshipId: string }>
> {
  static create(input: {
    organizationId: OrganizationId;
    workerId: WorkerId;
    managerId: WorkerId;
    relationshipId: ReportingRelationshipId;
    occurredAt?: Date;
  }): ManagerAssigned {
    return new ManagerAssigned({
      eventId: DomainEvent.nextEventId(),
      eventType: "ManagerAssigned",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.relationshipId,
      organizationId: input.organizationId,
      payload: {
        workerId: input.workerId,
        managerId: input.managerId,
        relationshipId: input.relationshipId,
      },
    });
  }
}

export class ManagerChanged extends DomainEvent<
  "ManagerChanged",
  Readonly<{
    workerId: string;
    previousManagerId: string | null;
    managerId: string;
    relationshipId: string;
  }>
> {
  static create(input: {
    organizationId: OrganizationId;
    workerId: WorkerId;
    previousManagerId: WorkerId | null;
    managerId: WorkerId;
    relationshipId: ReportingRelationshipId;
    occurredAt?: Date;
  }): ManagerChanged {
    return new ManagerChanged({
      eventId: DomainEvent.nextEventId(),
      eventType: "ManagerChanged",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.relationshipId,
      organizationId: input.organizationId,
      payload: {
        workerId: input.workerId,
        previousManagerId: input.previousManagerId,
        managerId: input.managerId,
        relationshipId: input.relationshipId,
      },
    });
  }
}

export class ReportingRelationshipCreated extends DomainEvent<
  "ReportingRelationshipCreated",
  Readonly<{
    relationshipId: string;
    workerId: string;
    managerId: string;
    effectiveDate: string;
  }>
> {
  static create(input: {
    organizationId: OrganizationId;
    relationshipId: ReportingRelationshipId;
    workerId: WorkerId;
    managerId: WorkerId;
    effectiveDate: Date;
    occurredAt?: Date;
  }): ReportingRelationshipCreated {
    return new ReportingRelationshipCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ReportingRelationshipCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.relationshipId,
      organizationId: input.organizationId,
      payload: {
        relationshipId: input.relationshipId,
        workerId: input.workerId,
        managerId: input.managerId,
        effectiveDate: input.effectiveDate.toISOString(),
      },
    });
  }
}

export class ReportingRelationshipEnded extends DomainEvent<
  "ReportingRelationshipEnded",
  Readonly<{
    relationshipId: string;
    workerId: string;
    managerId: string;
    endDate: string;
  }>
> {
  static create(input: {
    organizationId: OrganizationId;
    relationshipId: ReportingRelationshipId;
    workerId: WorkerId;
    managerId: WorkerId;
    endDate: Date;
    occurredAt?: Date;
  }): ReportingRelationshipEnded {
    return new ReportingRelationshipEnded({
      eventId: DomainEvent.nextEventId(),
      eventType: "ReportingRelationshipEnded",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.relationshipId,
      organizationId: input.organizationId,
      payload: {
        relationshipId: input.relationshipId,
        workerId: input.workerId,
        managerId: input.managerId,
        endDate: input.endDate.toISOString(),
      },
    });
  }
}
