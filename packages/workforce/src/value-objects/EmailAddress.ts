import { ValueObject } from "@creative-lab/core";
import { WorkerValidationError } from "../errors/WorkforceErrors.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailAddress extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): EmailAddress {
    if (typeof raw !== "string") {
      throw new WorkerValidationError("Email must be a string.");
    }
    const value = raw.trim().toLowerCase();
    if (!value) {
      throw new WorkerValidationError("Email is required.");
    }
    if (value.length > 254 || !EMAIL_PATTERN.test(value)) {
      throw new WorkerValidationError(`Invalid email address: ${raw}`);
    }
    return new EmailAddress(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: EmailAddress | null | undefined): boolean {
    return super.equals(other);
  }

  override toString(): string {
    return this.props.value;
  }
}
