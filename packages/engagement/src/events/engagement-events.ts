import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { EngagementStatus } from "../enums/EngagementStatus.js";
import type { DeliverableStatus } from "../enums/DeliverableStatus.js";
import type { MilestoneStatus } from "../enums/MilestoneStatus.js";
import type { ObligationStatus } from "../enums/ObligationStatus.js";
import type {
  DeliverableId,
  EngagementId,
  MilestoneId,
  ObligationId,
} from "../types/ids.js";

export class EngagementCreated extends DomainEvent<
  "EngagementCreated",
  Readonly<{
    engagementId: string;
    engagementNumber: string;
    customerId: string;
    contractId: string;
    status: EngagementStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    engagementId: EngagementId;
    engagementNumber: string;
    customerId: string;
    contractId: string;
    status: EngagementStatus;
    occurredAt?: Date;
  }): EngagementCreated {
    return new EngagementCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "EngagementCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.engagementId,
      organizationId: input.organizationId,
      payload: {
        engagementId: input.engagementId,
        engagementNumber: input.engagementNumber,
        customerId: input.customerId,
        contractId: input.contractId,
        status: input.status,
      },
    });
  }
}

export class EngagementActivated extends DomainEvent<
  "EngagementActivated",
  Readonly<{ engagementId: string }>
> {
  static create(input: {
    organizationId: string;
    engagementId: EngagementId;
    occurredAt?: Date;
  }): EngagementActivated {
    return new EngagementActivated({
      eventId: DomainEvent.nextEventId(),
      eventType: "EngagementActivated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.engagementId,
      organizationId: input.organizationId,
      payload: { engagementId: input.engagementId },
    });
  }
}

export class EngagementSuspended extends DomainEvent<
  "EngagementSuspended",
  Readonly<{ engagementId: string }>
> {
  static create(input: {
    organizationId: string;
    engagementId: EngagementId;
    occurredAt?: Date;
  }): EngagementSuspended {
    return new EngagementSuspended({
      eventId: DomainEvent.nextEventId(),
      eventType: "EngagementSuspended",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.engagementId,
      organizationId: input.organizationId,
      payload: { engagementId: input.engagementId },
    });
  }
}

export class EngagementCompleted extends DomainEvent<
  "EngagementCompleted",
  Readonly<{ engagementId: string; completedDate: string }>
> {
  static create(input: {
    organizationId: string;
    engagementId: EngagementId;
    completedDate: Date;
    occurredAt?: Date;
  }): EngagementCompleted {
    return new EngagementCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "EngagementCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.engagementId,
      organizationId: input.organizationId,
      payload: {
        engagementId: input.engagementId,
        completedDate: input.completedDate.toISOString(),
      },
    });
  }
}

export class EngagementCancelled extends DomainEvent<
  "EngagementCancelled",
  Readonly<{ engagementId: string }>
> {
  static create(input: {
    organizationId: string;
    engagementId: EngagementId;
    occurredAt?: Date;
  }): EngagementCancelled {
    return new EngagementCancelled({
      eventId: DomainEvent.nextEventId(),
      eventType: "EngagementCancelled",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.engagementId,
      organizationId: input.organizationId,
      payload: { engagementId: input.engagementId },
    });
  }
}

export class EngagementArchived extends DomainEvent<
  "EngagementArchived",
  Readonly<{ engagementId: string }>
> {
  static create(input: {
    organizationId: string;
    engagementId: EngagementId;
    occurredAt?: Date;
  }): EngagementArchived {
    return new EngagementArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "EngagementArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.engagementId,
      organizationId: input.organizationId,
      payload: { engagementId: input.engagementId },
    });
  }
}

export class DeliverableCreated extends DomainEvent<
  "DeliverableCreated",
  Readonly<{
    deliverableId: string;
    engagementId: string;
    title: string;
    sequence: number;
  }>
> {
  static create(input: {
    organizationId: string;
    deliverableId: DeliverableId;
    engagementId: EngagementId;
    title: string;
    sequence: number;
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
        engagementId: input.engagementId,
        title: input.title,
        sequence: input.sequence,
      },
    });
  }
}

export class DeliverableCompleted extends DomainEvent<
  "DeliverableCompleted",
  Readonly<{ deliverableId: string; engagementId: string }>
> {
  static create(input: {
    organizationId: string;
    deliverableId: DeliverableId;
    engagementId: EngagementId;
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
        engagementId: input.engagementId,
      },
    });
  }
}

export class DeliverableAccepted extends DomainEvent<
  "DeliverableAccepted",
  Readonly<{
    deliverableId: string;
    engagementId: string;
    status: DeliverableStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    deliverableId: DeliverableId;
    engagementId: EngagementId;
    status: DeliverableStatus;
    occurredAt?: Date;
  }): DeliverableAccepted {
    return new DeliverableAccepted({
      eventId: DomainEvent.nextEventId(),
      eventType: "DeliverableAccepted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.deliverableId,
      organizationId: input.organizationId,
      payload: {
        deliverableId: input.deliverableId,
        engagementId: input.engagementId,
        status: input.status,
      },
    });
  }
}

export class MilestoneCreated extends DomainEvent<
  "MilestoneCreated",
  Readonly<{
    milestoneId: string;
    engagementId: string;
    title: string;
    sequence: number;
  }>
> {
  static create(input: {
    organizationId: string;
    milestoneId: MilestoneId;
    engagementId: EngagementId;
    title: string;
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
        engagementId: input.engagementId,
        title: input.title,
        sequence: input.sequence,
      },
    });
  }
}

export class MilestoneActivated extends DomainEvent<
  "MilestoneActivated",
  Readonly<{
    milestoneId: string;
    engagementId: string;
    status: MilestoneStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    milestoneId: MilestoneId;
    engagementId: EngagementId;
    status: MilestoneStatus;
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
        engagementId: input.engagementId,
        status: input.status,
      },
    });
  }
}

export class MilestoneCompleted extends DomainEvent<
  "MilestoneCompleted",
  Readonly<{ milestoneId: string; engagementId: string }>
> {
  static create(input: {
    organizationId: string;
    milestoneId: MilestoneId;
    engagementId: EngagementId;
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
        engagementId: input.engagementId,
      },
    });
  }
}

export class ObligationCreated extends DomainEvent<
  "ObligationCreated",
  Readonly<{
    obligationId: string;
    engagementId: string;
    title: string;
    status: ObligationStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    obligationId: ObligationId;
    engagementId: EngagementId;
    title: string;
    status: ObligationStatus;
    occurredAt?: Date;
  }): ObligationCreated {
    return new ObligationCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ObligationCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.obligationId,
      organizationId: input.organizationId,
      payload: {
        obligationId: input.obligationId,
        engagementId: input.engagementId,
        title: input.title,
        status: input.status,
      },
    });
  }
}

export class ObligationFulfilled extends DomainEvent<
  "ObligationFulfilled",
  Readonly<{ obligationId: string; engagementId: string }>
> {
  static create(input: {
    organizationId: string;
    obligationId: ObligationId;
    engagementId: EngagementId;
    occurredAt?: Date;
  }): ObligationFulfilled {
    return new ObligationFulfilled({
      eventId: DomainEvent.nextEventId(),
      eventType: "ObligationFulfilled",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.obligationId,
      organizationId: input.organizationId,
      payload: {
        obligationId: input.obligationId,
        engagementId: input.engagementId,
      },
    });
  }
}

export class ObligationWaived extends DomainEvent<
  "ObligationWaived",
  Readonly<{ obligationId: string; engagementId: string }>
> {
  static create(input: {
    organizationId: string;
    obligationId: ObligationId;
    engagementId: EngagementId;
    occurredAt?: Date;
  }): ObligationWaived {
    return new ObligationWaived({
      eventId: DomainEvent.nextEventId(),
      eventType: "ObligationWaived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.obligationId,
      organizationId: input.organizationId,
      payload: {
        obligationId: input.obligationId,
        engagementId: input.engagementId,
      },
    });
  }
}
