import type { ReviewSession } from "../aggregates/ReviewSession/ReviewSession.js";
import { SessionAlreadyActiveError } from "../errors/ReviewErrors.js";
import type { ReviewId } from "../types/ids.js";

export class SessionPolicy {
  static assertNoActiveSession(
    existing: readonly ReviewSession[],
    reviewId: ReviewId,
  ): void {
    const active = existing.find(
      (s) => s.reviewId === reviewId && s.isActive,
    );
    if (active) {
      throw new SessionAlreadyActiveError(reviewId);
    }
  }
}
