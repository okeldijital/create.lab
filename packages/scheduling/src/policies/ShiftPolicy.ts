import type { WorkingPattern } from "@creative-lab/capacity";
import type { Shift } from "../aggregates/Shift/Shift.js";
import { InvalidShiftError } from "../errors/SchedulingErrors.js";

export class ShiftPolicy {
  static assertValidDuration(shift: Shift): void {
    if (shift.durationMinutes <= 0) {
      throw new InvalidShiftError("Shift duration must be positive.");
    }
  }

  static assertWorkingPatternBelongs(
    pattern: WorkingPattern | null,
    organizationId: string,
  ): void {
    if (!pattern) {
      throw new InvalidShiftError("Working pattern not found for shift.");
    }
    if (pattern.organizationId !== organizationId) {
      throw new InvalidShiftError(
        "Working pattern must belong to the same organization as the shift.",
      );
    }
  }
}
