import { ValueObject } from "@creative-lab/core";
import { BookingLifecycleError } from "../errors/SchedulingErrors.js";

export class BookingTitle extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): BookingTitle {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new BookingLifecycleError("Booking title is required.");
    }
    if (value.length > 200) {
      throw new BookingLifecycleError(
        "Booking title must be at most 200 characters.",
      );
    }
    return new BookingTitle(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: BookingTitle | null | undefined): boolean {
    return super.equals(other);
  }
}
