import { ValueObject } from "@creative-lab/core";
import { BillingValidationError } from "../errors/BillingErrors.js";

export class InvoiceDescription extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): InvoiceDescription {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new BillingValidationError("Line description is required.");
    }
    if (value.length > 500) {
      throw new BillingValidationError(
        "Line description must be at most 500 characters.",
      );
    }
    return new InvoiceDescription(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: InvoiceDescription | null | undefined): boolean {
    return super.equals(other);
  }
}
