import { ValueObject } from "@creative-lab/core";
import { CRMValidationError } from "../errors/CRMErrors.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailAddress extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): EmailAddress {
    const value = typeof raw === "string" ? raw.trim().toLowerCase() : "";
    if (!value) {
      throw new CRMValidationError("Email address is required.");
    }
    if (value.length > 254) {
      throw new CRMValidationError(
        "Email address must be at most 254 characters.",
      );
    }
    if (!EMAIL_RE.test(value)) {
      throw new CRMValidationError(`Invalid email address: ${raw}`);
    }
    return new EmailAddress(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: EmailAddress | null | undefined): boolean {
    return super.equals(other);
  }
}
