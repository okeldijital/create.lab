import { ValueObject } from "@creative-lab/core";
import { BillingValidationError } from "../errors/BillingErrors.js";

export class CreditReference extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): CreditReference {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new BillingValidationError("Credit reference is required.");
    }
    if (value.length > 100) {
      throw new BillingValidationError(
        "Credit reference must be at most 100 characters.",
      );
    }
    return new CreditReference(value);
  }
  static generate(now: Date = new Date()): CreditReference {
    const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return CreditReference.create(`CN-${stamp}-${rand}`);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: CreditReference | null | undefined): boolean {
    return super.equals(other);
  }
}
