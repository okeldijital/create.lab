import { ValueObject } from "@creative-lab/core";
import { ScheduleValidationError } from "../errors/SchedulingErrors.js";

export class ScheduleName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): ScheduleName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ScheduleValidationError("Schedule name is required.");
    }
    if (value.length > 150) {
      throw new ScheduleValidationError(
        "Schedule name must be at most 150 characters.",
      );
    }
    return new ScheduleName(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: ScheduleName | null | undefined): boolean {
    return super.equals(other);
  }
}
