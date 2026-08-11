import type { Obligation } from "../aggregates/Obligation/Obligation.js";
import { ObligationStatus } from "../enums/ObligationStatus.js";
import {
  EngagementValidationError,
  ObligationAlreadyFulfilledError,
} from "../errors/EngagementErrors.js";

export class ObligationPolicy {
  static assertPending(obligation: Obligation): void {
    if (obligation.status !== ObligationStatus.PENDING) {
      throw new ObligationAlreadyFulfilledError(obligation.id);
    }
  }

  static assertCanFulfill(obligation: Obligation): void {
    ObligationPolicy.assertPending(obligation);
  }

  static assertCanWaive(obligation: Obligation): void {
    ObligationPolicy.assertPending(obligation);
  }

  static assertValidParty(party: string): void {
    if (!["ORGANIZATION", "CUSTOMER", "BOTH"].includes(party)) {
      throw new EngagementValidationError(
        `Invalid obligation party: ${party}`,
      );
    }
  }
}
