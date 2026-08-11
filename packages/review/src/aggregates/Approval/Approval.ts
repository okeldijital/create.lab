import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { ApprovalStatus } from "../../enums/ApprovalStatus.js";
import {
  ApprovalAlreadyCompletedError,
  InvalidReviewStateError,
} from "../../errors/ReviewErrors.js";
import {
  ApprovalCompleted,
  ApprovalCreated,
  ApprovalRejected,
} from "../../events/review-events.js";
import {
  asApprovalId,
  type ApprovalId,
  type ReviewId,
} from "../../types/ids.js";
import { ApprovalCount } from "../../value-objects/ApprovalCount.js";
import { ApprovalRequirement } from "../../value-objects/ApprovalRequirement.js";

export type CreateApprovalProps = {
  organizationId: OrganizationId;
  reviewId: ReviewId;
  requiredApprovals: number;
  id?: string;
  now?: Date;
};

export type ApprovalSnapshot = {
  id: ApprovalId;
  organizationId: OrganizationId;
  reviewId: ReviewId;
  status: ApprovalStatus;
  requiredApprovals: number;
  completedApprovals: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Formal approval workflow under a review.
 * Auto-completes when completedApprovals ≥ requiredApprovals.
 */
export class Approval extends AggregateRoot<ApprovalId> {
  private constructor(
    id: ApprovalId,
    private readonly _organizationId: OrganizationId,
    private readonly _reviewId: ReviewId,
    private _status: ApprovalStatus,
    private readonly _requiredApprovals: ApprovalRequirement,
    private _completedApprovals: ApprovalCount,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateApprovalProps): Approval {
    if (!props.reviewId) {
      throw new InvalidReviewStateError("Approval requires a review.");
    }
    const now = props.now ?? new Date();
    const id = asApprovalId(props.id ?? generateId());
    const approval = new Approval(
      id,
      props.organizationId,
      props.reviewId,
      ApprovalStatus.PENDING,
      ApprovalRequirement.create(props.requiredApprovals),
      ApprovalCount.zero(),
      now,
      now,
    );
    approval.record(
      ApprovalCreated.create({
        organizationId: props.organizationId,
        approvalId: id,
        reviewId: props.reviewId,
        requiredApprovals: props.requiredApprovals,
        status: ApprovalStatus.PENDING,
        occurredAt: now,
      }),
    );
    return approval;
  }

  static reconstitute(snapshot: ApprovalSnapshot): Approval {
    return new Approval(
      snapshot.id,
      snapshot.organizationId,
      snapshot.reviewId,
      snapshot.status,
      ApprovalRequirement.create(snapshot.requiredApprovals),
      ApprovalCount.create(snapshot.completedApprovals),
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
  get status(): ApprovalStatus {
    return this._status;
  }
  get requiredApprovals(): number {
    return this._requiredApprovals.value;
  }
  get completedApprovals(): number {
    return this._completedApprovals.value;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isCompleted(): boolean {
    return (
      this._status === ApprovalStatus.APPROVED ||
      this._status === ApprovalStatus.REJECTED ||
      this._status === ApprovalStatus.CANCELLED
    );
  }

  /**
   * Record one APPROVE decision contribution.
   * Automatically completes when requirement met.
   */
  recordApproval(now: Date = new Date()): void {
    this.assertNotCompleted();
    const next = this._completedApprovals.increment();
    if (next.value > this._requiredApprovals.value) {
      throw new InvalidReviewStateError(
        "Completed approvals cannot exceed required approvals.",
      );
    }
    this._completedApprovals = next;
    this._updatedAt = now;

    if (next.meets(this._requiredApprovals.value)) {
      this._status = ApprovalStatus.APPROVED;
      this.record(
        ApprovalCompleted.create({
          organizationId: this._organizationId,
          approvalId: this.id,
          reviewId: this._reviewId,
          occurredAt: now,
        }),
      );
    } else {
      this._status = ApprovalStatus.PARTIALLY_APPROVED;
    }
  }

  reject(now: Date = new Date()): void {
    this.assertNotCompleted();
    this._status = ApprovalStatus.REJECTED;
    this._updatedAt = now;
    this.record(
      ApprovalRejected.create({
        organizationId: this._organizationId,
        approvalId: this.id,
        reviewId: this._reviewId,
        occurredAt: now,
      }),
    );
  }

  cancel(now: Date = new Date()): void {
    this.assertNotCompleted();
    this._status = ApprovalStatus.CANCELLED;
    this._updatedAt = now;
  }

  toSnapshot(): ApprovalSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      reviewId: this._reviewId,
      status: this._status,
      requiredApprovals: this._requiredApprovals.value,
      completedApprovals: this._completedApprovals.value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private assertNotCompleted(): void {
    if (this.isCompleted) {
      throw new ApprovalAlreadyCompletedError(this.id);
    }
  }
}
