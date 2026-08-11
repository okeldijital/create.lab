import { ValueObject } from "@creative-lab/core";
import { BillingValidationError } from "../errors/BillingErrors.js";

export class InvoiceNumber extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): InvoiceNumber {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new BillingValidationError("Invoice number is required.");
    }
    if (value.length > 64) {
      throw new BillingValidationError(
        "Invoice number must be at most 64 characters.",
      );
    }
    return new InvoiceNumber(value);
  }
  static generate(now: Date = new Date()): InvoiceNumber {
    const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return InvoiceNumber.create(`INV-${stamp}-${rand}`);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: InvoiceNumber | null | undefined): boolean {
    return super.equals(other);
  }
}
