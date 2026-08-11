import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { ReviewStatus } from "../enums/ReviewStatus.js";
import type { ApprovalStatus } from "../enums/ApprovalStatus.js";
import type { SessionStatus } from "../enums/SessionStatus.js";
import type { DecisionType } from "../enums/DecisionType.js";
import type {
  ApprovalId,
  ReviewDecisionId,
  ReviewId,
  ReviewSessionId,
} from "../types/ids.js";

export class ReviewCreated extends DomainEvent<
  "ReviewCreated",
  Readonly<{
    reviewId: string;
    projectId: string;
    productionId: string;
    assetId: string;
    title: string;
    status: ReviewStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    reviewId: ReviewId;
    projectId: string;
    productionId: string;
    assetId: string;
    title: string;
    status: ReviewStatus;
    occurredAt?: Date;
  }): ReviewCreated {
    return new ReviewCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ReviewCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.reviewId,
      organizationId: input.organizationId,
      payload: {
        reviewId: input.reviewId,
        projectId: input.projectId,
        productionId: input.productionId,
        assetId: input.assetId,
        title: input.title,
        status: input.status,
      },
    });
  }
}

export class ReviewStarted extends DomainEvent<
  "ReviewStarted",
  Readonly<{ reviewId: string }>
> {
  static create(input: {
    organizationId: string;
    reviewId: ReviewId;
    occurredAt?: Date;
  }): ReviewStarted {
    return new ReviewStarted({
      eventId: DomainEvent.nextEventId(),
      eventType: "ReviewStarted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.reviewId,
      organizationId: input.organizationId,
      payload: { reviewId: input.reviewId },
    });
  }
}

export class ReviewApproved extends DomainEvent<
  "ReviewApproved",
  Readonly<{ reviewId: string }>
> {
  static create(input: {
    organizationId: string;
    reviewId: ReviewId;
    occurredAt?: Date;
  }): ReviewApproved {
    return new ReviewApproved({
      eventId: DomainEvent.nextEventId(),
      eventType: "ReviewApproved",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.reviewId,
      organizationId: input.organizationId,
      payload: { reviewId: input.reviewId },
    });
  }
}

export class ReviewRejected extends DomainEvent<
  "ReviewRejected",
  Readonly<{ reviewId: string }>
> {
  static create(input: {
    organizationId: string;
    reviewId: ReviewId;
    occurredAt?: Date;
  }): ReviewRejected {
    return new ReviewRejected({
      eventId: DomainEvent.nextEventId(),
      eventType: "ReviewRejected",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.reviewId,
      organizationId: input.organizationId,
      payload: { reviewId: input.reviewId },
    });
  }
}

export class ReviewArchived extends DomainEvent<
  "ReviewArchived",
  Readonly<{ reviewId: string }>
> {
  static create(input: {
    organizationId: string;
    reviewId: ReviewId;
    occurredAt?: Date;
  }): ReviewArchived {
    return new ReviewArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "ReviewArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.reviewId,
      organizationId: input.organizationId,
      payload: { reviewId: input.reviewId },
    });
  }
}

export class ApprovalCreated extends DomainEvent<
  "ApprovalCreated",
  Readonly<{
    approvalId: string;
    reviewId: string;
    requiredApprovals: number;
    status: ApprovalStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    approvalId: ApprovalId;
    reviewId: ReviewId;
    requiredApprovals: number;
    status: ApprovalStatus;
    occurredAt?: Date;
  }): ApprovalCreated {
    return new ApprovalCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ApprovalCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.approvalId,
      organizationId: input.organizationId,
      payload: {
        approvalId: input.approvalId,
        reviewId: input.reviewId,
        requiredApprovals: input.requiredApprovals,
        status: input.status,
      },
    });
  }
}

export class ApprovalCompleted extends DomainEvent<
  "ApprovalCompleted",
  Readonly<{ approvalId: string; reviewId: string }>
> {
  static create(input: {
    organizationId: string;
    approvalId: ApprovalId;
    reviewId: ReviewId;
    occurredAt?: Date;
  }): ApprovalCompleted {
    return new ApprovalCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "ApprovalCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.approvalId,
      organizationId: input.organizationId,
      payload: {
        approvalId: input.approvalId,
        reviewId: input.reviewId,
      },
    });
  }
}

export class ApprovalRejected extends DomainEvent<
  "ApprovalRejected",
  Readonly<{ approvalId: string; reviewId: string }>
> {
  static create(input: {
    organizationId: string;
    approvalId: ApprovalId;
    reviewId: ReviewId;
    occurredAt?: Date;
  }): ApprovalRejected {
    return new ApprovalRejected({
      eventId: DomainEvent.nextEventId(),
      eventType: "ApprovalRejected",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.approvalId,
      organizationId: input.organizationId,
      payload: {
        approvalId: input.approvalId,
        reviewId: input.reviewId,
      },
    });
  }
}

export class ReviewSessionOpened extends DomainEvent<
  "ReviewSessionOpened",
  Readonly<{ sessionId: string; reviewId: string; status: SessionStatus }>
> {
  static create(input: {
    organizationId: string;
    sessionId: ReviewSessionId;
    reviewId: ReviewId;
    status: SessionStatus;
    occurredAt?: Date;
  }): ReviewSessionOpened {
    return new ReviewSessionOpened({
      eventId: DomainEvent.nextEventId(),
      eventType: "ReviewSessionOpened",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.sessionId,
      organizationId: input.organizationId,
      payload: {
        sessionId: input.sessionId,
        reviewId: input.reviewId,
        status: input.status,
      },
    });
  }
}

export class ReviewSessionCompleted extends DomainEvent<
  "ReviewSessionCompleted",
  Readonly<{ sessionId: string; reviewId: string }>
> {
  static create(input: {
    organizationId: string;
    sessionId: ReviewSessionId;
    reviewId: ReviewId;
    occurredAt?: Date;
  }): ReviewSessionCompleted {
    return new ReviewSessionCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "ReviewSessionCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.sessionId,
      organizationId: input.organizationId,
      payload: {
        sessionId: input.sessionId,
        reviewId: input.reviewId,
      },
    });
  }
}

export class DecisionRecorded extends DomainEvent<
  "DecisionRecorded",
  Readonly<{
    decisionId: string;
    approvalId: string;
    reviewerId: string;
    decision: DecisionType;
  }>
> {
  static create(input: {
    organizationId: string;
    decisionId: ReviewDecisionId;
    approvalId: ApprovalId;
    reviewerId: string;
    decision: DecisionType;
    occurredAt?: Date;
  }): DecisionRecorded {
    return new DecisionRecorded({
      eventId: DomainEvent.nextEventId(),
      eventType: "DecisionRecorded",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.decisionId,
      organizationId: input.organizationId,
      payload: {
        decisionId: input.decisionId,
        approvalId: input.approvalId,
        reviewerId: input.reviewerId,
        decision: input.decision,
      },
    });
  }
}
