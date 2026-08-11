import { ValueObject } from "@creative-lab/core";
import { QuotationValidationError } from "../errors/QuotationErrors.js";

export class ValidityPeriod extends ValueObject<{
  validUntil: string | null;
}> {
  private constructor(validUntil: Date | null) {
    super({
      validUntil: validUntil ? validUntil.toISOString() : null,
    });
  }

  static create(validUntil: Date | null | undefined): ValidityPeriod {
    if (validUntil == null) {
      return new ValidityPeriod(null);
    }
    const d = new Date(validUntil);
    if (Number.isNaN(d.getTime())) {
      throw new QuotationValidationError("Invalid validity date.");
    }
    return new ValidityPeriod(d);
  }

  get validUntil(): Date | null {
    return this.props.validUntil ? new Date(this.props.validUntil) : null;
  }

  isExpired(now: Date = new Date()): boolean {
    if (!this.props.validUntil) return false;
    return now.getTime() > new Date(this.props.validUntil).getTime();
  }

  override equals(other: ValidityPeriod | null | undefined): boolean {
    return super.equals(other);
  }
}
