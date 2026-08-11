import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { DecisionType } from "../../enums/DecisionType.js";
import { InvalidReviewStateError } from "../../errors/ReviewErrors.js";
import { DecisionRecorded } from "../../events/review-events.js";
import {
  asReviewDecisionId,
  type ApprovalId,
  type ReviewDecisionId,
} from "../../types/ids.js";
import { DecisionNotes } from "../../value-objects/DecisionNotes.js";
import { ReviewerReference } from "../../value-objects/ReviewerReference.js";

export type CreateReviewDecisionProps = {
  organizationId: OrganizationId;
  approvalId: ApprovalId;
  reviewerId: string;
  decision: DecisionType;
  notes?: string | null;
  id?: string;
  now?: Date;
};

export type ReviewDecisionSnapshot = {
  id: ReviewDecisionId;
  organizationId: OrganizationId;
  approvalId: ApprovalId;
  reviewerId: string;
  decision: DecisionType;
  notes: string | null;
  createdAt: Date;
};

/**
 * Immutable reviewer response. Cannot be edited after create.
 */
export class ReviewDecision extends AggregateRoot<ReviewDecisionId> {
  private constructor(
    id: ReviewDecisionId,
    private readonly _organizationId: OrganizationId,
    private readonly _approvalId: ApprovalId,
    private readonly _reviewerId: ReviewerReference,
    private readonly _decision: DecisionType,
    private readonly _notes: DecisionNotes,
    private readonly _createdAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateReviewDecisionProps): ReviewDecision {
    if (!props.approvalId) {
      throw new InvalidReviewStateError("Decision requires an approval.");
    }
    if (!Object.values(DecisionType).includes(props.decision)) {
      throw new InvalidReviewStateError(
        `Invalid decision type: ${String(props.decision)}`,
      );
    }
    const now = props.now ?? new Date();
    const id = asReviewDecisionId(props.id ?? generateId());
    const decision = new ReviewDecision(
      id,
      props.organizationId,
      props.approvalId,
      ReviewerReference.create(props.reviewerId),
      props.decision,
      DecisionNotes.create(props.notes),
      now,
    );
    decision.record(
      DecisionRecorded.create({
        organizationId: props.organizationId,
        decisionId: id,
        approvalId: props.approvalId,
        reviewerId: decision._reviewerId.value,
        decision: props.decision,
        occurredAt: now,
      }),
    );
    return decision;
  }

  static reconstitute(snapshot: ReviewDecisionSnapshot): ReviewDecision {
    return new ReviewDecision(
      snapshot.id,
      snapshot.organizationId,
      snapshot.approvalId,
      ReviewerReference.create(snapshot.reviewerId),
      snapshot.decision,
      DecisionNotes.create(snapshot.notes),
      new Date(snapshot.createdAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get approvalId(): ApprovalId {
    return this._approvalId;
  }
  get reviewerId(): string {
    return this._reviewerId.value;
  }
  get decision(): DecisionType {
    return this._decision;
  }
  get notes(): DecisionNotes {
    return this._notes;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get isApprove(): boolean {
    return this._decision === DecisionType.APPROVE;
  }
  get isReject(): boolean {
    return this._decision === DecisionType.REJECT;
  }

  toSnapshot(): ReviewDecisionSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      approvalId: this._approvalId,
      reviewerId: this._reviewerId.value,
      decision: this._decision,
      notes: this._notes.value,
      createdAt: this.createdAt,
    };
  }
}
