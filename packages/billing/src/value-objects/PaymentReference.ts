import { ValueObject } from "@creative-lab/core";
import { BillingValidationError } from "../errors/BillingErrors.js";

export class PaymentReference extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): PaymentReference {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new BillingValidationError("Payment reference is required.");
    }
    if (value.length > 100) {
      throw new BillingValidationError(
        "Payment reference must be at most 100 characters.",
      );
    }
    return new PaymentReference(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: PaymentReference | null | undefined): boolean {
    return super.equals(other);
  }
}
