import { ValueObject } from "@creative-lab/core";
import { EngagementValidationError } from "../errors/EngagementErrors.js";

export class TargetDate extends ValueObject<{ value: string }> {
  private constructor(value: Date) {
    super({ value: value.toISOString() });
  }
  static create(raw: Date): TargetDate {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) {
      throw new EngagementValidationError("Invalid target date.");
    }
    return new TargetDate(d);
  }
  get value(): Date {
    return new Date(this.props.value);
  }
  isBefore(other: TargetDate): boolean {
    return this.value.getTime() < other.value.getTime();
  }
  isAfter(other: TargetDate): boolean {
    return this.value.getTime() > other.value.getTime();
  }
  override equals(other: TargetDate | null | undefined): boolean {
    return super.equals(other);
  }
}
