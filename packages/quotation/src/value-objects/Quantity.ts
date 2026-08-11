import { ValueObject } from "@creative-lab/core";
import { QuotationValidationError } from "../errors/QuotationErrors.js";

export class Quantity extends ValueObject<{ value: number }> {
  private constructor(value: number) {
    super({ value });
  }
  static create(raw: number): Quantity {
    if (!Number.isFinite(raw) || Number.isNaN(raw)) {
      throw new QuotationValidationError("Quantity must be a finite number.");
    }
    if (raw <= 0) {
      throw new QuotationValidationError("Quantity must be > 0.");
    }
    return new Quantity(raw);
  }
  get value(): number {
    return this.props.value;
  }
  override equals(other: Quantity | null | undefined): boolean {
    return super.equals(other);
  }
}
