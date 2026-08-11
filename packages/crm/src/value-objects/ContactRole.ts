import { ValueObject } from "@creative-lab/core";
import { CRMValidationError } from "../errors/CRMErrors.js";

export class ContactRole extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): ContactRole {
    if (raw == null || (typeof raw === "string" && !raw.trim())) {
      return new ContactRole(null);
    }
    const value = raw.trim();
    if (value.length > 120) {
      throw new CRMValidationError(
        "Contact role must be at most 120 characters.",
      );
    }
    return new ContactRole(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: ContactRole | null | undefined): boolean {
    return super.equals(other);
  }
}
