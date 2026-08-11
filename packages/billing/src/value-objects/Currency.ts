import { ValueObject } from "@creative-lab/core";
import { BillingValidationError } from "../errors/BillingErrors.js";

const ISO_4217 = /^[A-Z]{3}$/;

export class Currency extends ValueObject<{ code: string }> {
  private constructor(code: string) {
    super({ code });
  }
  static create(raw: string): Currency {
    const code = typeof raw === "string" ? raw.trim().toUpperCase() : "";
    if (!ISO_4217.test(code)) {
      throw new BillingValidationError(
        `Currency must be a 3-letter ISO code (received ${String(raw)}).`,
      );
    }
    return new Currency(code);
  }
  static USD(): Currency {
    return Currency.create("USD");
  }
  get code(): string {
    return this.props.code;
  }
  override equals(other: Currency | null | undefined): boolean {
    return super.equals(other);
  }
}
