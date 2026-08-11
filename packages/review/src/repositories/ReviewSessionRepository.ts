import type { ReviewSession } from "../aggregates/ReviewSession/ReviewSession.js";
import type { ReviewId, ReviewSessionId } from "../types/ids.js";

export interface ReviewSessionRepository {
  findById(id: ReviewSessionId): Promise<ReviewSession | null>;
  findByReview(reviewId: ReviewId): Promise<ReviewSession[]>;
  findActive(reviewId: ReviewId): Promise<ReviewSession | null>;
  save(session: ReviewSession): Promise<void>;
  update(session: ReviewSession): Promise<void>;
}
