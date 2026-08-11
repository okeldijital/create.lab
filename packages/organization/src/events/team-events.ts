import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { DepartmentId, OrganizationId, TeamId } from "../types/ids.js";
import type { TeamStatus } from "../enums/TeamStatus.js";

type TeamCreatedPayload = Readonly<{
  teamId: string;
  departmentId: string;
  name: string;
  status: TeamStatus;
}>;

export class TeamCreated extends DomainEvent<"TeamCreated", TeamCreatedPayload> {
  static create(input: {
    organizationId: OrganizationId;
    teamId: TeamId;
    departmentId: DepartmentId;
    name: string;
    status: TeamStatus;
    occurredAt?: Date;
  }): TeamCreated {
    return new TeamCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "TeamCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.teamId,
      organizationId: input.organizationId,
      payload: {
        teamId: input.teamId,
        departmentId: input.departmentId,
        name: input.name,
        status: input.status,
      },
    });
  }
}

type TeamUpdatedPayload = Readonly<{
  teamId: string;
  departmentId: string;
  name: string;
  description: string | null;
  status: TeamStatus;
}>;

export class TeamUpdated extends DomainEvent<"TeamUpdated", TeamUpdatedPayload> {
  static create(input: {
    organizationId: OrganizationId;
    teamId: TeamId;
    departmentId: DepartmentId;
    name: string;
    description: string | null;
    status: TeamStatus;
    occurredAt?: Date;
  }): TeamUpdated {
    return new TeamUpdated({
      eventId: DomainEvent.nextEventId(),
      eventType: "TeamUpdated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.teamId,
      organizationId: input.organizationId,
      payload: {
        teamId: input.teamId,
        departmentId: input.departmentId,
        name: input.name,
        description: input.description,
        status: input.status,
      },
    });
  }
}

type TeamArchivedPayload = Readonly<{
  teamId: string;
}>;

export class TeamArchived extends DomainEvent<"TeamArchived", TeamArchivedPayload> {
  static create(input: {
    organizationId: OrganizationId;
    teamId: TeamId;
    occurredAt?: Date;
  }): TeamArchived {
    return new TeamArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "TeamArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.teamId,
      organizationId: input.organizationId,
      payload: {
        teamId: input.teamId,
      },
    });
  }
}
