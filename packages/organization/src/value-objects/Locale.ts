import { ValueObject } from "@creative-lab/core";
import { OrganizationValidationError } from "../errors/OrganizationErrors.js";

/**
 * BCP 47 locale tag (e.g. "en", "en-US", "fr-CA").
 */
export class Locale extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): Locale {
    if (typeof raw !== "string") {
      throw new OrganizationValidationError("Locale must be a string.");
    }
    const value = raw.trim();
    if (value.length === 0) {
      throw new OrganizationValidationError("Locale is required.");
    }
    if (!/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(value)) {
      throw new OrganizationValidationError(`Invalid locale: ${raw}`);
    }
    return new Locale(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: Locale | null | undefined): boolean {
    return super.equals(other);
  }

  override toString(): string {
    return this.props.value;
  }
}
