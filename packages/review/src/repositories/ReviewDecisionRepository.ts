import type { ReviewDecision } from "../aggregates/ReviewDecision/ReviewDecision.js";
import type { ApprovalId, ReviewDecisionId } from "../types/ids.js";

export interface ReviewDecisionRepository {
  findById(id: ReviewDecisionId): Promise<ReviewDecision | null>;
  findByApproval(approvalId: ApprovalId): Promise<ReviewDecision[]>;
  save(decision: ReviewDecision): Promise<void>;
  update(decision: ReviewDecision): Promise<void>;
}
