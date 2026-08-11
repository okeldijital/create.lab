import { ValueObject } from "@creative-lab/core";
import { QuotationValidationError } from "../errors/QuotationErrors.js";
import { Currency } from "./Currency.js";

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
      throw new QuotationValidationError(
        "Money amount must be a finite number.",
      );
    }
    if (!Number.isInteger(minorUnits)) {
      throw new QuotationValidationError(
        "Money minor units must be an integer.",
      );
    }
    if (minorUnits < 0) {
      throw new QuotationValidationError("Money cannot be negative.");
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

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.fromMinorUnits(
      this.props.minorUnits + other.props.minorUnits,
      this.props.currency,
    );
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this.props.minorUnits - other.props.minorUnits;
    if (result < 0) {
      throw new QuotationValidationError(
        "Money subtraction would be negative.",
      );
    }
    return Money.fromMinorUnits(result, this.props.currency);
  }

  multiply(factor: number): Money {
    if (!Number.isFinite(factor) || Number.isNaN(factor) || factor < 0) {
      throw new QuotationValidationError("Money factor must be ≥ 0 finite.");
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

  private assertSameCurrency(other: Money): void {
    if (this.props.currency !== other.props.currency) {
      throw new QuotationValidationError(
        `Currency mismatch: ${this.props.currency} vs ${other.props.currency}.`,
      );
    }
  }

  override equals(other: Money | null | undefined): boolean {
    return super.equals(other);
  }
}
