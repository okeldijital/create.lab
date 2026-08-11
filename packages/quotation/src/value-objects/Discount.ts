import { ValueObject } from "@creative-lab/core";
import { QuotationValidationError } from "../errors/QuotationErrors.js";
import { Currency } from "./Currency.js";
import { Money } from "./Money.js";

/**
 * Absolute discount amount in minor units (not a percentage).
 */
export class Discount extends ValueObject<{
  minorUnits: number;
  currency: string;
}> {
  private constructor(minorUnits: number, currency: string) {
    super({ minorUnits, currency });
  }

  static fromMinorUnits(
    minorUnits: number,
    currency: Currency | string,
  ): Discount {
    if (!Number.isFinite(minorUnits) || Number.isNaN(minorUnits)) {
      throw new QuotationValidationError(
        "Discount must be a finite number.",
      );
    }
    if (!Number.isInteger(minorUnits) || minorUnits < 0) {
      throw new QuotationValidationError(
        "Discount must be a non-negative integer (minor units).",
      );
    }
    const cur =
      typeof currency === "string" ? Currency.create(currency) : currency;
    return new Discount(minorUnits, cur.code);
  }

  static zero(currency: Currency | string): Discount {
    return Discount.fromMinorUnits(0, currency);
  }

  get minorUnits(): number {
    return this.props.minorUnits;
  }
  get currencyCode(): string {
    return this.props.currency;
  }

  toMoney(): Money {
    return Money.fromMinorUnits(this.props.minorUnits, this.props.currency);
  }

  override equals(other: Discount | null | undefined): boolean {
    return super.equals(other);
  }
}
