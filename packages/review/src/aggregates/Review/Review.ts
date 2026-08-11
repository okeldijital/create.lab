import { AggregateRoot, generateId } from "@creative-lab/core";
import type { AssetId } from "@creative-lab/assets";
import type { OrganizationId } from "@creative-lab/organization";
import type { ProductionId } from "@creative-lab/production";
import type { ProjectId } from "@creative-lab/projects";
import {
  ReviewStatus,
  canTransitionReview,
} from "../../enums/ReviewStatus.js";
import {
  InvalidReviewStateError,
  ReviewAlreadyApprovedError,
} from "../../errors/ReviewErrors.js";
import {
  ReviewApproved,
  ReviewArchived,
  ReviewCreated,
  ReviewRejected,
  ReviewStarted,
} from "../../events/review-events.js";
import {
  asReviewId,
  type ApprovalId,
  type ReviewId,
  type ReviewSessionId,
} from "../../types/ids.js";
import { ReviewDescription } from "../../value-objects/ReviewDescription.js";
import { ReviewTitle } from "../../value-objects/ReviewTitle.js";

export type CreateReviewProps = {
  organizationId: OrganizationId;
  projectId: ProjectId;
  productionId: ProductionId;
  assetId: AssetId;
  title: string;
  description?: string | null;
  id?: string;
  now?: Date;
};

export type ReviewSnapshot = {
  id: ReviewId;
  organizationId: OrganizationId;
  projectId: ProjectId;
  productionId: ProductionId;
  assetId: AssetId;
  title: string;
  description: string | null;
  status: ReviewStatus;
  approvalIds: string[];
  reviewSessionIds: string[];
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Formal review of a production asset.
 * Project, production, and asset references are immutable after create.
 */
export class Review extends AggregateRoot<ReviewId> {
  private constructor(
    id: ReviewId,
    private readonly _organizationId: OrganizationId,
    private readonly _projectId: ProjectId,
    private readonly _productionId: ProductionId,
    private readonly _assetId: AssetId,
    private _title: ReviewTitle,
    private _description: ReviewDescription,
    private _status: ReviewStatus,
    private _approvalIds: ApprovalId[],
    private _reviewSessionIds: ReviewSessionId[],
    private _archived: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateReviewProps): Review {
    if (!props.projectId) {
      throw new InvalidReviewStateError("Review requires a project reference.");
    }
    if (!props.productionId) {
      throw new InvalidReviewStateError(
        "Review requires a production reference.",
      );
    }
    if (!props.assetId) {
      throw new InvalidReviewStateError("Review requires an asset reference.");
    }
    const now = props.now ?? new Date();
    const id = asReviewId(props.id ?? generateId());
    const review = new Review(
      id,
      props.organizationId,
      props.projectId,
      props.productionId,
      props.assetId,
      ReviewTitle.create(props.title),
      ReviewDescription.create(props.description),
      ReviewStatus.DRAFT,
      [],
      [],
      false,
      now,
      now,
    );
    review.record(
      ReviewCreated.create({
        organizationId: props.organizationId,
        reviewId: id,
        projectId: props.projectId,
        productionId: props.productionId,
        assetId: props.assetId,
        title: review._title.value,
        status: ReviewStatus.DRAFT,
        occurredAt: now,
      }),
    );
    return review;
  }

  static reconstitute(snapshot: ReviewSnapshot): Review {
    return new Review(
      snapshot.id,
      snapshot.organizationId,
      snapshot.projectId,
      snapshot.productionId,
      snapshot.assetId,
      ReviewTitle.create(snapshot.title),
      ReviewDescription.create(snapshot.description),
      snapshot.status,
      snapshot.approvalIds as ApprovalId[],
      snapshot.reviewSessionIds as ReviewSessionId[],
      snapshot.archived,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get projectId(): ProjectId {
    return this._projectId;
  }
  get productionId(): ProductionId {
    return this._productionId;
  }
  get assetId(): AssetId {
    return this._assetId;
  }
  get title(): ReviewTitle {
    return this._title;
  }
  get description(): ReviewDescription {
    return this._description;
  }
  get status(): ReviewStatus {
    return this._status;
  }
  get approvalIds(): readonly ApprovalId[] {
    return [...this._approvalIds];
  }
  get reviewSessionIds(): readonly ReviewSessionId[] {
    return [...this._reviewSessionIds];
  }
  get archived(): boolean {
    return this._archived;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isApproved(): boolean {
    return this._status === ReviewStatus.APPROVED;
  }
  get isTerminal(): boolean {
    return (
      this._status === ReviewStatus.APPROVED ||
      this._status === ReviewStatus.ARCHIVED
    );
  }

  start(now: Date = new Date()): void {
    this.assertMutable();
    this.transitionTo(ReviewStatus.IN_REVIEW, now);
    this.record(
      ReviewStarted.create({
        organizationId: this._organizationId,
        reviewId: this.id,
        occurredAt: now,
      }),
    );
  }

  markApproved(now: Date = new Date()): void {
    this.assertMutable();
    if (this._status === ReviewStatus.APPROVED) {
      throw new ReviewAlreadyApprovedError(this.id);
    }
    this.transitionTo(ReviewStatus.APPROVED, now);
    this.record(
      ReviewApproved.create({
        organizationId: this._organizationId,
        reviewId: this.id,
        occurredAt: now,
      }),
    );
  }

  markRejected(now: Date = new Date()): void {
    this.assertMutable();
    this.transitionTo(ReviewStatus.REJECTED, now);
    this.record(
      ReviewRejected.create({
        organizationId: this._organizationId,
        reviewId: this.id,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._archived) {
      throw new InvalidReviewStateError("Review is already archived.");
    }
    this.transitionTo(ReviewStatus.ARCHIVED, now);
    this._archived = true;
    this.record(
      ReviewArchived.create({
        organizationId: this._organizationId,
        reviewId: this.id,
        occurredAt: now,
      }),
    );
  }

  attachApproval(approvalId: ApprovalId, now: Date = new Date()): void {
    this.assertMutable();
    if (!approvalId) {
      throw new InvalidReviewStateError("Approval id is required.");
    }
    if (this._approvalIds.includes(approvalId)) return;
    this._approvalIds = [...this._approvalIds, approvalId];
    this._updatedAt = now;
  }

  attachSession(sessionId: ReviewSessionId, now: Date = new Date()): void {
    this.assertMutable();
    if (!sessionId) {
      throw new InvalidReviewStateError("Session id is required.");
    }
    if (this._reviewSessionIds.includes(sessionId)) return;
    this._reviewSessionIds = [...this._reviewSessionIds, sessionId];
    this._updatedAt = now;
  }

  updateDetails(props: {
    title?: string;
    description?: string | null;
    now?: Date;
  }): void {
    this.assertMutable();
    if (this._status !== ReviewStatus.DRAFT) {
      throw new InvalidReviewStateError(
        "Only DRAFT reviews can update title/description.",
      );
    }
    const now = props.now ?? new Date();
    if (props.title !== undefined) {
      this._title = ReviewTitle.create(props.title);
    }
    if (props.description !== undefined) {
      this._description = ReviewDescription.create(props.description);
    }
    this._updatedAt = now;
  }

  toSnapshot(): ReviewSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      projectId: this._projectId,
      productionId: this._productionId,
      assetId: this._assetId,
      title: this._title.value,
      description: this._description.value,
      status: this._status,
      approvalIds: this._approvalIds.map(String),
      reviewSessionIds: this._reviewSessionIds.map(String),
      archived: this._archived,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private transitionTo(to: ReviewStatus, now: Date): void {
    if (this._archived && to !== ReviewStatus.ARCHIVED) {
      throw new InvalidReviewStateError(
        "Archived reviews cannot be modified.",
      );
    }
    if (!canTransitionReview(this._status, to)) {
      throw new InvalidReviewStateError(
        `Cannot transition review from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to && to !== ReviewStatus.ARCHIVED) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertMutable(): void {
    if (this._archived || this._status === ReviewStatus.ARCHIVED) {
      throw new InvalidReviewStateError(
        "Archived reviews cannot be modified.",
      );
    }
  }
}
