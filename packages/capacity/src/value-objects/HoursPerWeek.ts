import { ValueObject } from "@creative-lab/core";
import { InvalidWorkingPatternError } from "../errors/CapacityErrors.js";

export class HoursPerWeek extends ValueObject<{ value: number }> {
  private constructor(value: number) {
    super({ value });
  }

  static create(value: number): HoursPerWeek {
    if (!Number.isFinite(value) || value <= 0) {
      throw new InvalidWorkingPatternError(
        `Hours per week must be positive (received ${value}).`,
      );
    }
    if (value > 168) {
      throw new InvalidWorkingPatternError(
        "Hours per week cannot exceed 168.",
      );
    }
    return new HoursPerWeek(value);
  }

  get value(): number {
    return this.props.value;
  }

  override equals(other: HoursPerWeek | null | undefined): boolean {
    return super.equals(other);
  }
}
