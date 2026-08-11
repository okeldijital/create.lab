import { ValueObject } from "@creative-lab/core";
import { QuotationValidationError } from "../errors/QuotationErrors.js";

export class QuoteNotes extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): QuoteNotes {
    if (raw == null || (typeof raw === "string" && !raw.trim())) {
      return new QuoteNotes(null);
    }
    const value = raw.trim();
    if (value.length > 2000) {
      throw new QuotationValidationError(
        "Notes must be at most 2000 characters.",
      );
    }
    return new QuoteNotes(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: QuoteNotes | null | undefined): boolean {
    return super.equals(other);
  }
}
