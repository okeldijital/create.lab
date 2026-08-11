import { ValueObject } from "@creative-lab/core";
import { DeliveryValidationError } from "../errors/DeliveryErrors.js";

export class RecipientReference extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): RecipientReference {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new DeliveryValidationError("Recipient reference is required.");
    }
    if (value.length > 100) {
      throw new DeliveryValidationError(
        "Recipient reference must be at most 100 characters.",
      );
    }
    return new RecipientReference(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: RecipientReference | null | undefined): boolean {
    return super.equals(other);
  }
}
