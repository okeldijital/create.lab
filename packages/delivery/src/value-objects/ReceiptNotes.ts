import { ValueObject } from "@creative-lab/core";
import { DeliveryValidationError } from "../errors/DeliveryErrors.js";

export class ReceiptNotes extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): ReceiptNotes {
    if (raw === null || raw === undefined || raw.trim() === "") {
      return new ReceiptNotes(null);
    }
    const value = raw.trim();
    if (value.length > 2000) {
      throw new DeliveryValidationError(
        "Receipt notes must be at most 2000 characters.",
      );
    }
    return new ReceiptNotes(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: ReceiptNotes | null | undefined): boolean {
    return super.equals(other);
  }
}
