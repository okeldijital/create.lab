import type { Engagement } from "../aggregates/Engagement/Engagement.js";
import {
  EngagementStatus,
  canTransitionEngagement,
} from "../enums/EngagementStatus.js";
import { InvalidEngagementStateError } from "../errors/EngagementErrors.js";

export class EngagementLifecyclePolicy {
  static assertCanTransition(
    engagement: Engagement,
    to: EngagementStatus,
  ): void {
    if (engagement.isArchived) {
      throw new InvalidEngagementStateError(
        "Archived engagements are immutable.",
      );
    }
    if (!canTransitionEngagement(engagement.status, to)) {
      throw new InvalidEngagementStateError(
        `Illegal engagement transition: ${engagement.status} → ${to}.`,
      );
    }
  }

  static assertActiveOrDraftStructure(engagement: Engagement): void {
    if (engagement.isArchived || engagement.isCompleted) {
      throw new InvalidEngagementStateError(
        "Cannot modify structure of completed or archived engagements.",
      );
    }
    if (engagement.status === EngagementStatus.CANCELLED) {
      throw new InvalidEngagementStateError(
        "Cannot modify structure of cancelled engagements.",
      );
    }
  }

  static assertOperational(engagement: Engagement): void {
    if (engagement.status !== EngagementStatus.ACTIVE) {
      throw new InvalidEngagementStateError(
        `Engagement must be ACTIVE for operational updates (status: ${engagement.status}).`,
      );
    }
  }
}
