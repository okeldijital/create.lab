import { ValueObject } from "@creative-lab/core";
import { CRMValidationError } from "../errors/CRMErrors.js";

export class PhoneNumber extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): PhoneNumber {
    if (raw == null || (typeof raw === "string" && !raw.trim())) {
      return new PhoneNumber(null);
    }
    const value = raw.trim();
    if (value.length > 40) {
      throw new CRMValidationError(
        "Phone number must be at most 40 characters.",
      );
    }
    return new PhoneNumber(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: PhoneNumber | null | undefined): boolean {
    return super.equals(other);
  }
}
