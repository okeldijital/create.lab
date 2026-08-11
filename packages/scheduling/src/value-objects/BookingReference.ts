import { ValueObject } from "@creative-lab/core";
import { BookingLifecycleError } from "../errors/SchedulingErrors.js";

/**
 * Opaque external/resource reference for a booking.
 * Does not imply assignment — scheduling remains assignment-agnostic.
 */
export class BookingReference extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string | null | undefined): BookingReference | null {
    if (raw === null || raw === undefined || raw.trim() === "") {
      return null;
    }
    const value = raw.trim();
    if (value.length > 200) {
      throw new BookingLifecycleError(
        "Booking reference must be at most 200 characters.",
      );
    }
    return new BookingReference(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: BookingReference | null | undefined): boolean {
    return super.equals(other);
  }
}
