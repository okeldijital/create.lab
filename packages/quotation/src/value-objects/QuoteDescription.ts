import { ValueObject } from "@creative-lab/core";
import { QuotationValidationError } from "../errors/QuotationErrors.js";

export class QuoteDescription extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): QuoteDescription {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new QuotationValidationError("Line description is required.");
    }
    if (value.length > 500) {
      throw new QuotationValidationError(
        "Line description must be at most 500 characters.",
      );
    }
    return new QuoteDescription(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: QuoteDescription | null | undefined): boolean {
    return super.equals(other);
  }
}
