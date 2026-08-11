import { ValueObject } from "@creative-lab/core";
import { QuotationValidationError } from "../errors/QuotationErrors.js";

export class QuoteNumber extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): QuoteNumber {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new QuotationValidationError("Quote number is required.");
    }
    if (value.length > 64) {
      throw new QuotationValidationError(
        "Quote number must be at most 64 characters.",
      );
    }
    return new QuoteNumber(value);
  }
  static generate(now: Date = new Date()): QuoteNumber {
    const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return QuoteNumber.create(`QTE-${stamp}-${rand}`);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: QuoteNumber | null | undefined): boolean {
    return super.equals(other);
  }
}
