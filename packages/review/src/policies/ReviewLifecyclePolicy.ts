import type { Review } from "../aggregates/Review/Review.js";
import {
  ReviewStatus,
  canTransitionReview,
} from "../enums/ReviewStatus.js";
import {
  InvalidReviewStateError,
  ReviewAlreadyApprovedError,
} from "../errors/ReviewErrors.js";

export class ReviewLifecyclePolicy {
  static assertCanTransition(review: Review, to: ReviewStatus): void {
    if (review.archived) {
      throw new InvalidReviewStateError(
        "Archived reviews cannot be modified.",
      );
    }
    if (!canTransitionReview(review.status, to)) {
      throw new InvalidReviewStateError(
        `Illegal review transition: ${review.status} → ${to}.`,
      );
    }
  }

  static assertMutable(review: Review): void {
    if (review.archived) {
      throw new InvalidReviewStateError(
        "Archived reviews cannot be modified.",
      );
    }
  }

  static assertCanApprove(review: Review): void {
    if (review.isApproved) {
      throw new ReviewAlreadyApprovedError(review.id);
    }
    ReviewLifecyclePolicy.assertCanTransition(
      review,
      ReviewStatus.APPROVED,
    );
  }

  static assertAcceptsActivity(review: Review): void {
    ReviewLifecyclePolicy.assertMutable(review);
    if (
      review.status === ReviewStatus.APPROVED ||
      review.status === ReviewStatus.ARCHIVED
    ) {
      throw new InvalidReviewStateError(
        `Review in status ${review.status} cannot accept new activity.`,
      );
    }
  }
}
