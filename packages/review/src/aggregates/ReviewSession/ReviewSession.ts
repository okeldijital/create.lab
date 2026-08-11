import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import {
  SessionStatus,
  canTransitionSession,
  isActiveSessionStatus,
} from "../../enums/SessionStatus.js";
import { InvalidReviewStateError } from "../../errors/ReviewErrors.js";
import {
  ReviewSessionCompleted,
  ReviewSessionOpened,
} from "../../events/review-events.js";
import {
  asReviewSessionId,
  type ReviewId,
  type ReviewSessionId,
} from "../../types/ids.js";

export type CreateReviewSessionProps = {
  organizationId: OrganizationId;
  reviewId: ReviewId;
  startedAt?: Date;
  id?: string;
  now?: Date;
};

export type ReviewSessionSnapshot = {
  id: ReviewSessionId;
  organizationId: OrganizationId;
  reviewId: ReviewId;
  startedAt: Date;
  endedAt: Date | null;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * One review meeting. OPEN → IN_PROGRESS → COMPLETED.
 * Only one active session per review (enforced by SessionPolicy).
 */
export class ReviewSession extends AggregateRoot<ReviewSessionId> {
  private constructor(
    id: ReviewSessionId,
    private readonly _organizationId: OrganizationId,
    private readonly _reviewId: ReviewId,
    private readonly _startedAt: Date,
    private _endedAt: Date | null,
    private _status: SessionStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateReviewSessionProps): ReviewSession {
    if (!props.reviewId) {
      throw new InvalidReviewStateError("Session requires a review.");
    }
    const now = props.now ?? new Date();
    const startedAt = props.startedAt ? new Date(props.startedAt) : now;
    if (Number.isNaN(startedAt.getTime())) {
      throw new InvalidReviewStateError(
        "Session startedAt must be a valid date.",
      );
    }
    const id = asReviewSessionId(props.id ?? generateId());
    const session = new ReviewSession(
      id,
      props.organizationId,
      props.reviewId,
      startedAt,
      null,
      SessionStatus.OPEN,
      now,
      now,
    );
    session.record(
      ReviewSessionOpened.create({
        organizationId: props.organizationId,
        sessionId: id,
        reviewId: props.reviewId,
        status: SessionStatus.OPEN,
        occurredAt: now,
      }),
    );
    return session;
  }

  static reconstitute(snapshot: ReviewSessionSnapshot): ReviewSession {
    return new ReviewSession(
      snapshot.id,
      snapshot.organizationId,
      snapshot.reviewId,
      new Date(snapshot.startedAt),
      snapshot.endedAt ? new Date(snapshot.endedAt) : null,
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get reviewId(): ReviewId {
    return this._reviewId;
  }
  get startedAt(): Date {
    return new Date(this._startedAt);
  }
  get endedAt(): Date | null {
    return this._endedAt ? new Date(this._endedAt) : null;
  }
  get status(): SessionStatus {
    return this._status;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isActive(): boolean {
    return isActiveSessionStatus(this._status);
  }

  startProgress(now: Date = new Date()): void {
    this.transitionTo(SessionStatus.IN_PROGRESS, now);
  }

  complete(endedAt: Date = new Date(), now: Date = endedAt): void {
    if (this._status === SessionStatus.COMPLETED) {
      throw new InvalidReviewStateError("Session is already completed.");
    }
    const end = new Date(endedAt);
    if (Number.isNaN(end.getTime())) {
      throw new InvalidReviewStateError(
        "Session endedAt must be a valid date.",
      );
    }
    if (end.getTime() < this._startedAt.getTime()) {
      throw new InvalidReviewStateError(
        "Session end cannot precede start.",
      );
    }
    this._endedAt = end;
    this._status = SessionStatus.COMPLETED;
    this._updatedAt = now;
    this.record(
      ReviewSessionCompleted.create({
        organizationId: this._organizationId,
        sessionId: this.id,
        reviewId: this._reviewId,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): ReviewSessionSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      reviewId: this._reviewId,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private transitionTo(to: SessionStatus, now: Date): void {
    if (this._status === SessionStatus.COMPLETED) {
      throw new InvalidReviewStateError("Completed sessions are immutable.");
    }
    if (!canTransitionSession(this._status, to)) {
      throw new InvalidReviewStateError(
        `Cannot transition session from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }
}
