import { ValueObject } from "@creative-lab/core";
import { DeliveryValidationError } from "../errors/DeliveryErrors.js";

export class DeliveryNotes extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): DeliveryNotes {
    if (raw === null || raw === undefined || raw.trim() === "") {
      return new DeliveryNotes(null);
    }
    const value = raw.trim();
    if (value.length > 2000) {
      throw new DeliveryValidationError(
        "Delivery notes must be at most 2000 characters.",
      );
    }
    return new DeliveryNotes(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: DeliveryNotes | null | undefined): boolean {
    return super.equals(other);
  }
}
