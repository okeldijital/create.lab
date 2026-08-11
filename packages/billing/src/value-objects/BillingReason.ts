import { ValueObject } from "@creative-lab/core";
import { BillingValidationError } from "../errors/BillingErrors.js";

export class BillingReason extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): BillingReason {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new BillingValidationError("Billing reason is required.");
    }
    if (value.length > 1000) {
      throw new BillingValidationError(
        "Billing reason must be at most 1000 characters.",
      );
    }
    return new BillingReason(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: BillingReason | null | undefined): boolean {
    return super.equals(other);
  }
}
