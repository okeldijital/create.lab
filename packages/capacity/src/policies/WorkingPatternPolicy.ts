import type { CapacityProfile } from "../aggregates/CapacityProfile/CapacityProfile.js";
import type { WorkingPattern } from "../aggregates/WorkingPattern/WorkingPattern.js";
import {
  CapacityProfileValidationError,
  WorkingPatternNotFoundError,
} from "../errors/CapacityErrors.js";

export class WorkingPatternPolicy {
  static assertAssignable(
    profile: CapacityProfile,
    pattern: WorkingPattern | null,
  ): void {
    if (!pattern) {
      throw new WorkingPatternNotFoundError("missing");
    }
    if (pattern.organizationId !== profile.organizationId) {
      throw new CapacityProfileValidationError(
        "Working pattern must belong to the same organization.",
      );
    }
  }

  static assertConsistentHours(pattern: WorkingPattern): void {
    if (
      pattern.hoursPerWeek.value >
      pattern.daysPerWeek * pattern.hoursPerDay.value + 0.001
    ) {
      throw new CapacityProfileValidationError(
        "Working pattern hours are inconsistent.",
      );
    }
  }
}
