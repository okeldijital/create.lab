import { ValueObject } from "@creative-lab/core";
import { ScheduleValidationError } from "../errors/SchedulingErrors.js";

export class CalendarName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): CalendarName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ScheduleValidationError("Calendar name is required.");
    }
    if (value.length > 150) {
      throw new ScheduleValidationError(
        "Calendar name must be at most 150 characters.",
      );
    }
    return new CalendarName(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: CalendarName | null | undefined): boolean {
    if (other == null || !(other instanceof CalendarName)) return false;
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
