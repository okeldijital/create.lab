import { ValueObject } from "@creative-lab/core";
import { WorkerValidationError } from "../errors/WorkforceErrors.js";

export class NoticePeriod extends ValueObject<{ days: number }> {
  private constructor(days: number) {
    super({ days });
  }

  static create(days: number): NoticePeriod {
    if (!Number.isInteger(days) || days < 0) {
      throw new WorkerValidationError(
        `Notice period days must be a non-negative integer (received ${days}).`,
      );
    }
    if (days > 365 * 2) {
      throw new WorkerValidationError(
        "Notice period cannot exceed 730 days.",
      );
    }
    return new NoticePeriod(days);
  }

  get days(): number {
    return this.props.days;
  }

  override equals(other: NoticePeriod | null | undefined): boolean {
    return super.equals(other);
  }
}
