import { ValueObject } from "@creative-lab/core";
import { OrganizationValidationError } from "../errors/OrganizationErrors.js";

const MIN_LENGTH = 1;
const MAX_LENGTH = 200;

/**
 * Immutable organization name value object.
 */
export class OrganizationName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): OrganizationName {
    if (typeof raw !== "string") {
      throw new OrganizationValidationError("Organization name must be a string.");
    }
    const value = raw.trim();
    if (value.length < MIN_LENGTH) {
      throw new OrganizationValidationError("Organization name is required.");
    }
    if (value.length > MAX_LENGTH) {
      throw new OrganizationValidationError(
        `Organization name must be at most ${MAX_LENGTH} characters.`,
      );
    }
    return new OrganizationName(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: OrganizationName | null | undefined): boolean {
    return super.equals(other);
  }

  override toString(): string {
    return this.props.value;
  }
}
