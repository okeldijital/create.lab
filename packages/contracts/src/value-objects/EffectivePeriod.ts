import { ValueObject } from "@creative-lab/core";
import { ContractValidationError } from "../errors/ContractErrors.js";

export class EffectivePeriod extends ValueObject<{
  effectiveDate: string;
  expiryDate: string | null;
}> {
  private constructor(effectiveDate: Date, expiryDate: Date | null) {
    super({
      effectiveDate: effectiveDate.toISOString(),
      expiryDate: expiryDate ? expiryDate.toISOString() : null,
    });
  }

  static create(
    effectiveDate: Date,
    expiryDate: Date | null | undefined,
  ): EffectivePeriod {
    const from = new Date(effectiveDate);
    if (Number.isNaN(from.getTime())) {
      throw new ContractValidationError("Invalid effective date.");
    }
    const to =
      expiryDate == null ? null : new Date(expiryDate);
    if (to && Number.isNaN(to.getTime())) {
      throw new ContractValidationError("Invalid expiry date.");
    }
    if (to && to.getTime() <= from.getTime()) {
      throw new ContractValidationError(
        "expiryDate must be after effectiveDate.",
      );
    }
    return new EffectivePeriod(from, to);
  }

  get effectiveDate(): Date {
    return new Date(this.props.effectiveDate);
  }
  get expiryDate(): Date | null {
    return this.props.expiryDate
      ? new Date(this.props.expiryDate)
      : null;
  }

  isExpired(now: Date = new Date()): boolean {
    if (!this.props.expiryDate) return false;
    return now.getTime() > new Date(this.props.expiryDate).getTime();
  }

  isEffective(now: Date = new Date()): boolean {
    if (now.getTime() < this.effectiveDate.getTime()) return false;
    if (this.isExpired(now)) return false;
    return true;
  }

  override equals(other: EffectivePeriod | null | undefined): boolean {
    return super.equals(other);
  }
}
