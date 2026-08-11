import { ValueObject } from "@creative-lab/core";
import { ServicesValidationError } from "../errors/ServicesErrors.js";
import { Currency } from "./Currency.js";

/**
 * Immutable monetary amount in minor units.
 */
export class Money extends ValueObject<{
  minorUnits: number;
  currency: string;
}> {
  private constructor(minorUnits: number, currency: string) {
    super({ minorUnits, currency });
  }

  static fromMinorUnits(
    minorUnits: number,
    currency: Currency | string,
  ): Money {
    if (!Number.isFinite(minorUnits) || Number.isNaN(minorUnits)) {
      throw new ServicesValidationError(
        "Money amount must be a finite number.",
      );
    }
    if (!Number.isInteger(minorUnits)) {
      throw new ServicesValidationError(
        "Money minor units must be an integer.",
      );
    }
    if (minorUnits < 0) {
      throw new ServicesValidationError("Money cannot be negative.");
    }
    const cur =
      typeof currency === "string" ? Currency.create(currency) : currency;
    return new Money(minorUnits, cur.code);
  }

  static zero(currency: Currency | string): Money {
    return Money.fromMinorUnits(0, currency);
  }

  get minorUnits(): number {
    return this.props.minorUnits;
  }
  get currencyCode(): string {
    return this.props.currency;
  }
  get isZero(): boolean {
    return this.props.minorUnits === 0;
  }

  greaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.props.minorUnits > other.props.minorUnits;
  }

  greaterThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.props.minorUnits >= other.props.minorUnits;
  }

  lessThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.props.minorUnits <= other.props.minorUnits;
  }

  private assertSameCurrency(other: Money): void {
    if (this.props.currency !== other.props.currency) {
      throw new ServicesValidationError(
        `Currency mismatch: ${this.props.currency} vs ${other.props.currency}.`,
      );
    }
  }

  override equals(other: Money | null | undefined): boolean {
    return super.equals(other);
  }
}
