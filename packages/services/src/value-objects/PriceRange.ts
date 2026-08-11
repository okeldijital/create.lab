import { ValueObject } from "@creative-lab/core";
import { InvalidPriceRangeError } from "../errors/ServicesErrors.js";
import { Money } from "./Money.js";

/**
 * Enforces minimum ≤ base ≤ maximum in the same currency.
 */
export class PriceRange extends ValueObject<{
  baseMinor: number;
  minimumMinor: number;
  maximumMinor: number;
  currency: string;
}> {
  private constructor(
    base: Money,
    minimum: Money,
    maximum: Money,
  ) {
    super({
      baseMinor: base.minorUnits,
      minimumMinor: minimum.minorUnits,
      maximumMinor: maximum.minorUnits,
      currency: base.currencyCode,
    });
  }

  static create(input: {
    baseMinor: number;
    minimumMinor: number;
    maximumMinor: number;
    currency: string;
  }): PriceRange {
    const base = Money.fromMinorUnits(input.baseMinor, input.currency);
    const minimum = Money.fromMinorUnits(input.minimumMinor, input.currency);
    const maximum = Money.fromMinorUnits(input.maximumMinor, input.currency);
    if (minimum.greaterThan(base)) {
      throw new InvalidPriceRangeError(
        "Minimum price cannot exceed base price.",
      );
    }
    if (base.greaterThan(maximum)) {
      throw new InvalidPriceRangeError(
        "Base price cannot exceed maximum price.",
      );
    }
    return new PriceRange(base, minimum, maximum);
  }

  get base(): Money {
    return Money.fromMinorUnits(this.props.baseMinor, this.props.currency);
  }
  get minimum(): Money {
    return Money.fromMinorUnits(this.props.minimumMinor, this.props.currency);
  }
  get maximum(): Money {
    return Money.fromMinorUnits(this.props.maximumMinor, this.props.currency);
  }
  get currencyCode(): string {
    return this.props.currency;
  }

  override equals(other: PriceRange | null | undefined): boolean {
    return super.equals(other);
  }
}
