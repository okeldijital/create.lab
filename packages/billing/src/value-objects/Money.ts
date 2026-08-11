import { ValueObject } from "@creative-lab/core";
import { BillingValidationError } from "../errors/BillingErrors.js";
import { Currency } from "./Currency.js";

/**
 * Immutable monetary amount in minor units (e.g. cents).
 * Rejects NaN and non-integers. Currency must match for arithmetic.
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
      throw new BillingValidationError("Money amount must be a finite number.");
    }
    if (!Number.isInteger(minorUnits)) {
      throw new BillingValidationError(
        "Money minor units must be an integer (use cents).",
      );
    }
    const cur =
      typeof currency === "string" ? Currency.create(currency) : currency;
    return new Money(minorUnits, cur.code);
  }

  /** Major units (e.g. dollars) converted with 2 decimal places. */
  static fromMajor(
    major: number,
    currency: Currency | string,
  ): Money {
    if (!Number.isFinite(major) || Number.isNaN(major)) {
      throw new BillingValidationError("Money amount must be a finite number.");
    }
    const minor = Math.round(major * 100);
    return Money.fromMinorUnits(minor, currency);
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
  get major(): number {
    return this.props.minorUnits / 100;
  }
  get isZero(): boolean {
    return this.props.minorUnits === 0;
  }
  get isPositive(): boolean {
    return this.props.minorUnits > 0;
  }
  get isNegative(): boolean {
    return this.props.minorUnits < 0;
  }

  assertNonNegative(label = "Amount"): void {
    if (this.props.minorUnits < 0) {
      throw new BillingValidationError(`${label} cannot be negative.`);
    }
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.fromMinorUnits(
      this.props.minorUnits + other.props.minorUnits,
      this.props.currency,
    );
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.fromMinorUnits(
      this.props.minorUnits - other.props.minorUnits,
      this.props.currency,
    );
  }

  /** Multiply by rational factor; rounds to nearest minor unit. */
  multiply(factor: number): Money {
    if (!Number.isFinite(factor) || Number.isNaN(factor)) {
      throw new BillingValidationError("Money factor must be finite.");
    }
    return Money.fromMinorUnits(
      Math.round(this.props.minorUnits * factor),
      this.props.currency,
    );
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
      throw new BillingValidationError(
        `Currency mismatch: ${this.props.currency} vs ${other.props.currency}.`,
      );
    }
  }

  override equals(other: Money | null | undefined): boolean {
    return super.equals(other);
  }
}
