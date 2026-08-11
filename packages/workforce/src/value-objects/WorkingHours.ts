import { ValueObject } from "@creative-lab/core";
import { WorkerValidationError } from "../errors/WorkforceErrors.js";

/**
 * Contracted weekly working hours (numeric).
 * Distinct from OrganizationSettings wall-clock windows.
 */
export class WorkingHours extends ValueObject<{ hoursPerWeek: number }> {
  private constructor(hoursPerWeek: number) {
    super({ hoursPerWeek });
  }

  static create(hoursPerWeek: number): WorkingHours {
    if (!Number.isFinite(hoursPerWeek) || hoursPerWeek < 0) {
      throw new WorkerValidationError(
        `Working hours cannot be negative (received ${hoursPerWeek}).`,
      );
    }
    if (hoursPerWeek > 168) {
      throw new WorkerValidationError(
        "Working hours cannot exceed 168 per week.",
      );
    }
    return new WorkingHours(hoursPerWeek);
  }

  static fullTime(): WorkingHours {
    return WorkingHours.create(40);
  }

  get hoursPerWeek(): number {
    return this.props.hoursPerWeek;
  }

  override equals(other: WorkingHours | null | undefined): boolean {
    return super.equals(other);
  }
}
