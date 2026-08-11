import { ValueObject } from "@creative-lab/core";
import { OrganizationValidationError } from "../errors/OrganizationErrors.js";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_LENGTH = 100;

/**
 * Immutable, URL-safe organization slug.
 * Uniqueness is enforced by the domain service / repository, not this VO.
 */
export class OrganizationSlug extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): OrganizationSlug {
    if (typeof raw !== "string") {
      throw new OrganizationValidationError("Organization slug must be a string.");
    }
    const value = raw.trim().toLowerCase();
    if (value.length === 0) {
      throw new OrganizationValidationError("Organization slug is required.");
    }
    if (value.length > MAX_LENGTH) {
      throw new OrganizationValidationError(
        `Organization slug must be at most ${MAX_LENGTH} characters.`,
      );
    }
    if (!SLUG_PATTERN.test(value)) {
      throw new OrganizationValidationError(
        "Organization slug must be lowercase alphanumeric with optional hyphens (e.g. acme-studios).",
      );
    }
    return new OrganizationSlug(value);
  }

  /**
   * Derive a slug candidate from a display name (caller still validates uniqueness).
   */
  static fromName(name: string): OrganizationSlug {
    const candidate = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, MAX_LENGTH);
    return OrganizationSlug.create(candidate);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: OrganizationSlug | null | undefined): boolean {
    return super.equals(other);
  }

  override toString(): string {
    return this.props.value;
  }
}
