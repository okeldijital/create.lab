import type { Deliverable } from "../aggregates/Deliverable/Deliverable.js";
import { DeliverableStatus } from "../enums/DeliverableStatus.js";
import {
  DeliverableAlreadyAcceptedError,
  EngagementValidationError,
} from "../errors/EngagementErrors.js";

export class DeliverablePolicy {
  static assertUniqueSequence(
    sequence: number,
    existing: readonly Deliverable[],
    excludeId?: string,
  ): void {
    const dup = existing.find(
      (d) => d.sequence === sequence && d.id !== excludeId,
    );
    if (dup) {
      throw new EngagementValidationError(
        `Deliverable sequence ${sequence} is already used.`,
      );
    }
  }

  static assertCanAccept(deliverable: Deliverable): void {
    if (deliverable.isAccepted) {
      throw new DeliverableAlreadyAcceptedError(deliverable.id);
    }
    if (deliverable.status !== DeliverableStatus.COMPLETED) {
      throw new EngagementValidationError(
        "Only COMPLETED deliverables can be accepted.",
      );
    }
  }

  static nextSequence(existing: readonly Deliverable[]): number {
    return existing.reduce((m, d) => Math.max(m, d.sequence), 0) + 1;
  }
}
