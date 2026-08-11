import { ValueObject } from "@creative-lab/core";
import { CRMValidationError } from "../errors/CRMErrors.js";

export class ContactName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string, label = "Name"): ContactName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new CRMValidationError(`${label} is required.`);
    }
    if (value.length > 100) {
      throw new CRMValidationError(
        `${label} must be at most 100 characters.`,
      );
    }
    return new ContactName(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: ContactName | null | undefined): boolean {
    return super.equals(other);
  }
}
