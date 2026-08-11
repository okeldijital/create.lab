import { ValueObject } from "@creative-lab/core";
import { OrganizationValidationError } from "../errors/OrganizationErrors.js";

/**
 * IANA timezone identifier (e.g. "America/New_York", "UTC").
 * Structural validation only — full IANA catalog is not embedded.
 */
export class Timezone extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): Timezone {
    if (typeof raw !== "string") {
      throw new OrganizationValidationError("Timezone must be a string.");
    }
    const value = raw.trim();
    if (value.length === 0) {
      throw new OrganizationValidationError("Timezone is required.");
    }
    // Basic IANA-like shape: Area/Location or UTC/GMT
    if (!/^[A-Za-z0-9_+-]+(?:\/[A-Za-z0-9_+-]+)*$/.test(value)) {
      throw new OrganizationValidationError(
        `Invalid timezone identifier: ${raw}`,
      );
    }
    return new Timezone(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: Timezone | null | undefined): boolean {
    return super.equals(other);
  }

  override toString(): string {
    return this.props.value;
  }
}
