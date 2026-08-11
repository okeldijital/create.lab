import { ValueObject } from "@creative-lab/core";
import { CRMValidationError } from "../errors/CRMErrors.js";

export class BillingAddress extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): BillingAddress {
    if (raw == null || (typeof raw === "string" && !raw.trim())) {
      return new BillingAddress(null);
    }
    const value = raw.trim();
    if (value.length > 1000) {
      throw new CRMValidationError(
        "Billing address must be at most 1000 characters.",
      );
    }
    return new BillingAddress(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: BillingAddress | null | undefined): boolean {
    return super.equals(other);
  }
}
