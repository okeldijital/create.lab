import { ValueObject } from "@creative-lab/core";
import { InvalidWorkingPatternError } from "../errors/CapacityErrors.js";

export class HoursPerDay extends ValueObject<{ value: number }> {
  private constructor(value: number) {
    super({ value });
  }

  static create(value: number): HoursPerDay {
    if (!Number.isFinite(value) || value <= 0) {
      throw new InvalidWorkingPatternError(
        `Hours per day must be positive (received ${value}).`,
      );
    }
    if (value > 24) {
      throw new InvalidWorkingPatternError("Hours per day cannot exceed 24.");
    }
    return new HoursPerDay(value);
  }

  get value(): number {
    return this.props.value;
  }

  override equals(other: HoursPerDay | null | undefined): boolean {
    return super.equals(other);
  }
}
