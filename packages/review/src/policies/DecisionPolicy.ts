import type { ReviewDecision } from "../aggregates/ReviewDecision/ReviewDecision.js";
import { DuplicateDecisionError } from "../errors/ReviewErrors.js";
import type { ApprovalId } from "../types/ids.js";
import { ReviewerReference } from "../value-objects/ReviewerReference.js";

export class DecisionPolicy {
  static assertOnePerReviewer(
    existing: readonly ReviewDecision[],
    approvalId: ApprovalId,
    reviewerId: string,
  ): void {
    const reviewer = ReviewerReference.create(reviewerId);
    const dup = existing.find(
      (d) =>
        d.approvalId === approvalId && d.reviewerId === reviewer.value,
    );
    if (dup) {
      throw new DuplicateDecisionError(reviewer.value, approvalId);
    }
  }
}
