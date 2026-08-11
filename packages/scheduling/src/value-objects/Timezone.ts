import { ValueObject } from "@creative-lab/core";
import { ScheduleValidationError } from "../errors/SchedulingErrors.js";

export class Timezone extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): Timezone {
    if (typeof raw !== "string") {
      throw new ScheduleValidationError("Timezone must be a string.");
    }
    const value = raw.trim();
    if (!value) {
      throw new ScheduleValidationError("Timezone is required.");
    }
    if (!/^[A-Za-z0-9_+-]+(?:\/[A-Za-z0-9_+-]+)*$/.test(value)) {
      throw new ScheduleValidationError(`Invalid timezone: ${raw}`);
    }
    return new Timezone(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: Timezone | null | undefined): boolean {
    return super.equals(other);
  }
}
