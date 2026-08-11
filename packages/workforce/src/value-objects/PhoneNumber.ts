import { ValueObject } from "@creative-lab/core";
import { WorkerValidationError } from "../errors/WorkforceErrors.js";

/** E.164-ish: optional +, digits, spaces, hyphens, parentheses (normalized to digits/+). */
export class PhoneNumber extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string | null | undefined): PhoneNumber | null {
    if (raw === null || raw === undefined || raw.trim() === "") {
      return null;
    }
    const trimmed = raw.trim();
    const normalized = trimmed.replace(/[\s().-]/g, "");
    if (!/^\+?[0-9]{7,15}$/.test(normalized)) {
      throw new WorkerValidationError(`Invalid phone number: ${raw}`);
    }
    return new PhoneNumber(normalized);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: PhoneNumber | null | undefined): boolean {
    return super.equals(other);
  }

  override toString(): string {
    return this.props.value;
  }
}
