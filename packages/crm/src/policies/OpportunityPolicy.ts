import type { Opportunity } from "../aggregates/Opportunity/Opportunity.js";
import {
  OpportunityStatus,
  canTransitionOpportunity,
} from "../enums/OpportunityStatus.js";
import { InvalidOpportunityStateError } from "../errors/CRMErrors.js";
import { OpportunityValue } from "../value-objects/OpportunityValue.js";
import { Probability } from "../value-objects/Probability.js";

export class OpportunityPolicy {
  static assertCanTransition(
    opportunity: Opportunity,
    to: OpportunityStatus,
  ): void {
    if (opportunity.isArchived) {
      throw new InvalidOpportunityStateError(
        "Archived opportunities are immutable.",
      );
    }
    if (!canTransitionOpportunity(opportunity.status, to)) {
      throw new InvalidOpportunityStateError(
        `Illegal opportunity transition: ${opportunity.status} → ${to}.`,
      );
    }
  }

  static assertValidProbability(value: number): Probability {
    return Probability.create(value);
  }

  static assertValidValue(minorUnits: number): OpportunityValue {
    return OpportunityValue.fromMinorUnits(minorUnits);
  }

  static assertCanWin(opportunity: Opportunity): void {
    OpportunityPolicy.assertCanTransition(
      opportunity,
      OpportunityStatus.WON,
    );
  }

  static assertCanLose(opportunity: Opportunity): void {
    OpportunityPolicy.assertCanTransition(
      opportunity,
      OpportunityStatus.LOST,
    );
  }
}
