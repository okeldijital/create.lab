import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { ProductionStatus } from "../enums/ProductionStatus.js";
import type { SessionStatus } from "../enums/SessionStatus.js";
import type { MilestoneStatus } from "../enums/MilestoneStatus.js";
import type { RevisionStatus } from "../enums/RevisionStatus.js";
import type {
  ProductionId,
  ProductionMilestoneId,
  ProductionSessionId,
  RevisionId,
} from "../types/ids.js";

export class ProductionCreated extends DomainEvent<
  "ProductionCreated",
  Readonly<{
    productionId: string;
    projectId: string;
    workOrderId: string;
    name: string;
    status: ProductionStatus;
    ownerId: string;
  }>
> {
  static create(input: {
    organizationId: string;
    productionId: ProductionId;
    projectId: string;
    workOrderId: string;
    name: string;
    status: ProductionStatus;
    ownerId: string;
    occurredAt?: Date;
  }): ProductionCreated {
    return new ProductionCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ProductionCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.productionId,
      organizationId: input.organizationId,
      payload: {
        productionId: input.productionId,
        projectId: input.projectId,
        workOrderId: input.workOrderId,
        name: input.name,
        status: input.status,
        ownerId: input.ownerId,
      },
    });
  }
}

export class ProductionStarted extends DomainEvent<
  "ProductionStarted",
  Readonly<{ productionId: string }>
> {
  static create(input: {
    organizationId: string;
    productionId: ProductionId;
    occurredAt?: Date;
  }): ProductionStarted {
    return new ProductionStarted({
      eventId: DomainEvent.nextEventId(),
      eventType: "ProductionStarted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.productionId,
      organizationId: input.organizationId,
      payload: { productionId: input.productionId },
    });
  }
}

export class ProductionPaused extends DomainEvent<
  "ProductionPaused",
  Readonly<{ productionId: string }>
> {
  static create(input: {
    organizationId: string;
    productionId: ProductionId;
    occurredAt?: Date;
  }): ProductionPaused {
    return new ProductionPaused({
      eventId: DomainEvent.nextEventId(),
      eventType: "ProductionPaused",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.productionId,
      organizationId: input.organizationId,
      payload: { productionId: input.productionId },
    });
  }
}

export class ProductionResumed extends DomainEvent<
  "ProductionResumed",
  Readonly<{ productionId: string }>
> {
  static create(input: {
    organizationId: string;
    productionId: ProductionId;
    occurredAt?: Date;
  }): ProductionResumed {
    return new ProductionResumed({
      eventId: DomainEvent.nextEventId(),
      eventType: "ProductionResumed",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.productionId,
      organizationId: input.organizationId,
      payload: { productionId: input.productionId },
    });
  }
}

export class ProductionCompleted extends DomainEvent<
  "ProductionCompleted",
  Readonly<{ productionId: string; completedAt: string }>
> {
  static create(input: {
    organizationId: string;
    productionId: ProductionId;
    completedAt: Date;
    occurredAt?: Date;
  }): ProductionCompleted {
    return new ProductionCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "ProductionCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.productionId,
      organizationId: input.organizationId,
      payload: {
        productionId: input.productionId,
        completedAt: input.completedAt.toISOString(),
      },
    });
  }
}

export class ProductionArchived extends DomainEvent<
  "ProductionArchived",
  Readonly<{ productionId: string }>
> {
  static create(input: {
    organizationId: string;
    productionId: ProductionId;
    occurredAt?: Date;
  }): ProductionArchived {
    return new ProductionArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "ProductionArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.productionId,
      organizationId: input.organizationId,
      payload: { productionId: input.productionId },
    });
  }
}

export class SessionOpened extends DomainEvent<
  "SessionOpened",
  Readonly<{ sessionId: string; productionId: string; startedAt: string }>
> {
  static create(input: {
    organizationId: string;
    sessionId: ProductionSessionId;
    productionId: ProductionId;
    startedAt: Date;
    occurredAt?: Date;
  }): SessionOpened {
    return new SessionOpened({
      eventId: DomainEvent.nextEventId(),
      eventType: "SessionOpened",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.sessionId,
      organizationId: input.organizationId,
      payload: {
        sessionId: input.sessionId,
        productionId: input.productionId,
        startedAt: input.startedAt.toISOString(),
      },
    });
  }
}

export class SessionPaused extends DomainEvent<
  "SessionPaused",
  Readonly<{ sessionId: string; productionId: string }>
> {
  static create(input: {
    organizationId: string;
    sessionId: ProductionSessionId;
    productionId: ProductionId;
    occurredAt?: Date;
  }): SessionPaused {
    return new SessionPaused({
      eventId: DomainEvent.nextEventId(),
      eventType: "SessionPaused",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.sessionId,
      organizationId: input.organizationId,
      payload: {
        sessionId: input.sessionId,
        productionId: input.productionId,
      },
    });
  }
}

export class SessionResumed extends DomainEvent<
  "SessionResumed",
  Readonly<{ sessionId: string; productionId: string }>
> {
  static create(input: {
    organizationId: string;
    sessionId: ProductionSessionId;
    productionId: ProductionId;
    occurredAt?: Date;
  }): SessionResumed {
    return new SessionResumed({
      eventId: DomainEvent.nextEventId(),
      eventType: "SessionResumed",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.sessionId,
      organizationId: input.organizationId,
      payload: {
        sessionId: input.sessionId,
        productionId: input.productionId,
      },
    });
  }
}

export class SessionCompleted extends DomainEvent<
  "SessionCompleted",
  Readonly<{
    sessionId: string;
    productionId: string;
    endedAt: string;
    durationMs: number;
  }>
> {
  static create(input: {
    organizationId: string;
    sessionId: ProductionSessionId;
    productionId: ProductionId;
    endedAt: Date;
    durationMs: number;
    occurredAt?: Date;
  }): SessionCompleted {
    return new SessionCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "SessionCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.sessionId,
      organizationId: input.organizationId,
      payload: {
        sessionId: input.sessionId,
        productionId: input.productionId,
        endedAt: input.endedAt.toISOString(),
        durationMs: input.durationMs,
      },
    });
  }
}

export class MilestoneCreated extends DomainEvent<
  "MilestoneCreated",
  Readonly<{
    milestoneId: string;
    productionId: string;
    name: string;
    sequence: number;
  }>
> {
  static create(input: {
    organizationId: string;
    milestoneId: ProductionMilestoneId;
    productionId: ProductionId;
    name: string;
    sequence: number;
    occurredAt?: Date;
  }): MilestoneCreated {
    return new MilestoneCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "MilestoneCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.milestoneId,
      organizationId: input.organizationId,
      payload: {
        milestoneId: input.milestoneId,
        productionId: input.productionId,
        name: input.name,
        sequence: input.sequence,
      },
    });
  }
}

export class MilestoneActivated extends DomainEvent<
  "MilestoneActivated",
  Readonly<{ milestoneId: string; productionId: string; name: string }>
> {
  static create(input: {
    organizationId: string;
    milestoneId: ProductionMilestoneId;
    productionId: ProductionId;
    name: string;
    occurredAt?: Date;
  }): MilestoneActivated {
    return new MilestoneActivated({
      eventId: DomainEvent.nextEventId(),
      eventType: "MilestoneActivated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.milestoneId,
      organizationId: input.organizationId,
      payload: {
        milestoneId: input.milestoneId,
        productionId: input.productionId,
        name: input.name,
      },
    });
  }
}

export class MilestoneCompleted extends DomainEvent<
  "MilestoneCompleted",
  Readonly<{ milestoneId: string; productionId: string; name: string }>
> {
  static create(input: {
    organizationId: string;
    milestoneId: ProductionMilestoneId;
    productionId: ProductionId;
    name: string;
    occurredAt?: Date;
  }): MilestoneCompleted {
    return new MilestoneCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "MilestoneCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.milestoneId,
      organizationId: input.organizationId,
      payload: {
        milestoneId: input.milestoneId,
        productionId: input.productionId,
        name: input.name,
      },
    });
  }
}

export class RevisionRequested extends DomainEvent<
  "RevisionRequested",
  Readonly<{
    revisionId: string;
    productionId: string;
    revisionNumber: number;
    status: RevisionStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    revisionId: RevisionId;
    productionId: ProductionId;
    revisionNumber: number;
    status: RevisionStatus;
    occurredAt?: Date;
  }): RevisionRequested {
    return new RevisionRequested({
      eventId: DomainEvent.nextEventId(),
      eventType: "RevisionRequested",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.revisionId,
      organizationId: input.organizationId,
      payload: {
        revisionId: input.revisionId,
        productionId: input.productionId,
        revisionNumber: input.revisionNumber,
        status: input.status,
      },
    });
  }
}

export class RevisionStarted extends DomainEvent<
  "RevisionStarted",
  Readonly<{ revisionId: string; productionId: string }>
> {
  static create(input: {
    organizationId: string;
    revisionId: RevisionId;
    productionId: ProductionId;
    occurredAt?: Date;
  }): RevisionStarted {
    return new RevisionStarted({
      eventId: DomainEvent.nextEventId(),
      eventType: "RevisionStarted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.revisionId,
      organizationId: input.organizationId,
      payload: {
        revisionId: input.revisionId,
        productionId: input.productionId,
      },
    });
  }
}

export class RevisionCompleted extends DomainEvent<
  "RevisionCompleted",
  Readonly<{ revisionId: string; productionId: string }>
> {
  static create(input: {
    organizationId: string;
    revisionId: RevisionId;
    productionId: ProductionId;
    occurredAt?: Date;
  }): RevisionCompleted {
    return new RevisionCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "RevisionCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.revisionId,
      organizationId: input.organizationId,
      payload: {
        revisionId: input.revisionId,
        productionId: input.productionId,
      },
    });
  }
}

export class RevisionClosed extends DomainEvent<
  "RevisionClosed",
  Readonly<{ revisionId: string; productionId: string }>
> {
  static create(input: {
    organizationId: string;
    revisionId: RevisionId;
    productionId: ProductionId;
    occurredAt?: Date;
  }): RevisionClosed {
    return new RevisionClosed({
      eventId: DomainEvent.nextEventId(),
      eventType: "RevisionClosed",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.revisionId,
      organizationId: input.organizationId,
      payload: {
        revisionId: input.revisionId,
        productionId: input.productionId,
      },
    });
  }
}

export type { SessionStatus, MilestoneStatus };
