import { ValueObject } from "@creative-lab/core";
import { OrganizationValidationError } from "../errors/OrganizationErrors.js";

/**
 * ISO 4217 currency code (e.g. "USD", "EUR", "GBP").
 */
export class Currency extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): Currency {
    if (typeof raw !== "string") {
      throw new OrganizationValidationError("Currency must be a string.");
    }
    const value = raw.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(value)) {
      throw new OrganizationValidationError(
        `Currency must be a 3-letter ISO 4217 code (received: ${raw}).`,
      );
    }
    return new Currency(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: Currency | null | undefined): boolean {
    return super.equals(other);
  }

  override toString(): string {
    return this.props.value;
  }
}
