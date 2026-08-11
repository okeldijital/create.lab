import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { ProjectStatus } from "../enums/ProjectStatus.js";
import type { PhaseStatus } from "../enums/PhaseStatus.js";
import type { DeliverableStatus } from "../enums/DeliverableStatus.js";
import type { DependencyType } from "../enums/DependencyType.js";
import type {
  DeliverableId,
  ProjectDependencyId,
  ProjectId,
  ProjectObjectiveId,
  ProjectPhaseId,
} from "../types/ids.js";

export class ProjectCreated extends DomainEvent<
  "ProjectCreated",
  Readonly<{
    projectId: string;
    name: string;
    status: ProjectStatus;
    ownerId: string;
  }>
> {
  static create(input: {
    organizationId: string;
    projectId: ProjectId;
    name: string;
    status: ProjectStatus;
    ownerId: string;
    occurredAt?: Date;
  }): ProjectCreated {
    return new ProjectCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ProjectCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.projectId,
      organizationId: input.organizationId,
      payload: {
        projectId: input.projectId,
        name: input.name,
        status: input.status,
        ownerId: input.ownerId,
      },
    });
  }
}

export class ProjectStarted extends DomainEvent<
  "ProjectStarted",
  Readonly<{ projectId: string }>
> {
  static create(input: {
    organizationId: string;
    projectId: ProjectId;
    occurredAt?: Date;
  }): ProjectStarted {
    return new ProjectStarted({
      eventId: DomainEvent.nextEventId(),
      eventType: "ProjectStarted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.projectId,
      organizationId: input.organizationId,
      payload: { projectId: input.projectId },
    });
  }
}

export class ProjectCompleted extends DomainEvent<
  "ProjectCompleted",
  Readonly<{ projectId: string; actualEndDate: string }>
> {
  static create(input: {
    organizationId: string;
    projectId: ProjectId;
    actualEndDate: Date;
    occurredAt?: Date;
  }): ProjectCompleted {
    return new ProjectCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "ProjectCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.projectId,
      organizationId: input.organizationId,
      payload: {
        projectId: input.projectId,
        actualEndDate: input.actualEndDate.toISOString(),
      },
    });
  }
}

export class ProjectClosed extends DomainEvent<
  "ProjectClosed",
  Readonly<{ projectId: string; closedAt: string }>
> {
  static create(input: {
    organizationId: string;
    projectId: ProjectId;
    closedAt: Date;
    occurredAt?: Date;
  }): ProjectClosed {
    return new ProjectClosed({
      eventId: DomainEvent.nextEventId(),
      eventType: "ProjectClosed",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.projectId,
      organizationId: input.organizationId,
      payload: {
        projectId: input.projectId,
        closedAt: input.closedAt.toISOString(),
      },
    });
  }
}

export class PhaseStarted extends DomainEvent<
  "PhaseStarted",
  Readonly<{ phaseId: string; projectId: string; name: string }>
> {
  static create(input: {
    organizationId: string;
    phaseId: ProjectPhaseId;
    projectId: ProjectId;
    name: string;
    occurredAt?: Date;
  }): PhaseStarted {
    return new PhaseStarted({
      eventId: DomainEvent.nextEventId(),
      eventType: "PhaseStarted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.phaseId,
      organizationId: input.organizationId,
      payload: {
        phaseId: input.phaseId,
        projectId: input.projectId,
        name: input.name,
      },
    });
  }
}

export class PhaseCompleted extends DomainEvent<
  "PhaseCompleted",
  Readonly<{ phaseId: string; projectId: string; name: string }>
> {
  static create(input: {
    organizationId: string;
    phaseId: ProjectPhaseId;
    projectId: ProjectId;
    name: string;
    occurredAt?: Date;
  }): PhaseCompleted {
    return new PhaseCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "PhaseCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.phaseId,
      organizationId: input.organizationId,
      payload: {
        phaseId: input.phaseId,
        projectId: input.projectId,
        name: input.name,
      },
    });
  }
}

export class DeliverableCreated extends DomainEvent<
  "DeliverableCreated",
  Readonly<{
    deliverableId: string;
    projectId: string;
    name: string;
    status: DeliverableStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    deliverableId: DeliverableId;
    projectId: ProjectId;
    name: string;
    status: DeliverableStatus;
    occurredAt?: Date;
  }): DeliverableCreated {
    return new DeliverableCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "DeliverableCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.deliverableId,
      organizationId: input.organizationId,
      payload: {
        deliverableId: input.deliverableId,
        projectId: input.projectId,
        name: input.name,
        status: input.status,
      },
    });
  }
}

export class DeliverableCompleted extends DomainEvent<
  "DeliverableCompleted",
  Readonly<{ deliverableId: string; projectId: string; name: string }>
> {
  static create(input: {
    organizationId: string;
    deliverableId: DeliverableId;
    projectId: ProjectId;
    name: string;
    occurredAt?: Date;
  }): DeliverableCompleted {
    return new DeliverableCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "DeliverableCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.deliverableId,
      organizationId: input.organizationId,
      payload: {
        deliverableId: input.deliverableId,
        projectId: input.projectId,
        name: input.name,
      },
    });
  }
}

export class ObjectiveAchieved extends DomainEvent<
  "ObjectiveAchieved",
  Readonly<{ objectiveId: string; projectId: string; name: string }>
> {
  static create(input: {
    organizationId: string;
    objectiveId: ProjectObjectiveId;
    projectId: ProjectId;
    name: string;
    occurredAt?: Date;
  }): ObjectiveAchieved {
    return new ObjectiveAchieved({
      eventId: DomainEvent.nextEventId(),
      eventType: "ObjectiveAchieved",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.objectiveId,
      organizationId: input.organizationId,
      payload: {
        objectiveId: input.objectiveId,
        projectId: input.projectId,
        name: input.name,
      },
    });
  }
}

export class DependencyCreated extends DomainEvent<
  "DependencyCreated",
  Readonly<{
    dependencyId: string;
    projectId: string;
    dependsOnProjectId: string;
    dependencyType: DependencyType;
  }>
> {
  static create(input: {
    organizationId: string;
    dependencyId: ProjectDependencyId;
    projectId: ProjectId;
    dependsOnProjectId: ProjectId;
    dependencyType: DependencyType;
    occurredAt?: Date;
  }): DependencyCreated {
    return new DependencyCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "DependencyCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.dependencyId,
      organizationId: input.organizationId,
      payload: {
        dependencyId: input.dependencyId,
        projectId: input.projectId,
        dependsOnProjectId: input.dependsOnProjectId,
        dependencyType: input.dependencyType,
      },
    });
  }
}

// re-export PhaseStatus for consumers that need typing only
export type { PhaseStatus };
