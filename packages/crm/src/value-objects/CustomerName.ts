import { ValueObject } from "@creative-lab/core";
import { CRMValidationError } from "../errors/CRMErrors.js";

export class CustomerName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): CustomerName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new CRMValidationError("Customer name is required.");
    }
    if (value.length > 200) {
      throw new CRMValidationError(
        "Customer name must be at most 200 characters.",
      );
    }
    return new CustomerName(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: CustomerName | null | undefined): boolean {
    return super.equals(other);
  }
}
