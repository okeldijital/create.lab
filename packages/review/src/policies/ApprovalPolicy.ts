import type { Approval } from "../aggregates/Approval/Approval.js";
import {
  ApprovalAlreadyCompletedError,
  InvalidReviewStateError,
} from "../errors/ReviewErrors.js";

export class ApprovalPolicy {
  static assertNotCompleted(approval: Approval): void {
    if (approval.isCompleted) {
      throw new ApprovalAlreadyCompletedError(approval.id);
    }
  }

  static assertCanRecordApproval(approval: Approval): void {
    ApprovalPolicy.assertNotCompleted(approval);
    if (
      approval.completedApprovals + 1 > approval.requiredApprovals
    ) {
      throw new InvalidReviewStateError(
        "Completed approvals cannot exceed required approvals.",
      );
    }
  }
}
