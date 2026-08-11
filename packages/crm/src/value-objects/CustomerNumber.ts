import { ValueObject } from "@creative-lab/core";
import { CRMValidationError } from "../errors/CRMErrors.js";

export class CustomerNumber extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): CustomerNumber {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new CRMValidationError("Customer number is required.");
    }
    if (value.length > 64) {
      throw new CRMValidationError(
        "Customer number must be at most 64 characters.",
      );
    }
    return new CustomerNumber(value);
  }
  static generate(now: Date = new Date()): CustomerNumber {
    const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return CustomerNumber.create(`CUST-${stamp}-${rand}`);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: CustomerNumber | null | undefined): boolean {
    return super.equals(other);
  }
}
