import { ValueObject } from "@creative-lab/core";
import { WorkerValidationError } from "../errors/WorkforceErrors.js";

export class ProbationPeriod extends ValueObject<{ days: number; active: boolean }> {
  private constructor(days: number, active: boolean) {
    super({ days, active });
  }

  static create(days: number, active = true): ProbationPeriod {
    if (!Number.isInteger(days) || days < 0) {
      throw new WorkerValidationError(
        `Probation days must be a non-negative integer (received ${days}).`,
      );
    }
    if (days > 365) {
      throw new WorkerValidationError("Probation cannot exceed 365 days.");
    }
    return new ProbationPeriod(days, active);
  }

  static none(): ProbationPeriod {
    return new ProbationPeriod(0, false);
  }

  get days(): number {
    return this.props.days;
  }
  get active(): boolean {
    return this.props.active;
  }

  override equals(other: ProbationPeriod | null | undefined): boolean {
    return super.equals(other);
  }
}
