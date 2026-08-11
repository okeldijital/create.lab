import type { CapacityProfile } from "../aggregates/CapacityProfile/CapacityProfile.js";
import { CapacityStatus } from "../enums/CapacityStatus.js";
import {
  CapacityProfileValidationError,
  OverlappingCapacityProfileError,
} from "../errors/CapacityErrors.js";
import { periodsOverlap } from "../utils/dates.js";

/**
 * One active profile per resource; non-overlapping effective dates.
 */
export class CapacityLifecyclePolicy {
  static assertCanCreateActive(
    existing: readonly CapacityProfile[],
    candidate: {
      resourceId: string;
      effectiveFrom: Date;
      effectiveTo: Date | null;
    },
  ): void {
    const active = existing.filter(
      (p) =>
        p.resourceId === candidate.resourceId &&
        p.status === CapacityStatus.ACTIVE,
    );
    for (const profile of active) {
      if (
        periodsOverlap(
          profile.effectiveFrom,
          profile.effectiveTo,
          candidate.effectiveFrom,
          candidate.effectiveTo,
        )
      ) {
        throw new OverlappingCapacityProfileError(candidate.resourceId);
      }
    }
  }

  static assertNotArchived(profile: CapacityProfile): void {
    if (profile.isArchived) {
      throw new CapacityProfileValidationError(
        "Operation not allowed on archived capacity profile.",
      );
    }
  }

  static assertActive(profile: CapacityProfile): void {
    if (!profile.isActive) {
      throw new CapacityProfileValidationError(
        "Capacity profile must be ACTIVE for this operation.",
      );
    }
  }
}
