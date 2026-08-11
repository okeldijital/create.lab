import { ValueObject } from "@creative-lab/core";
import { EngagementValidationError } from "../errors/EngagementErrors.js";

export class EngagementDescription extends ValueObject<{
  value: string | null;
}> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): EngagementDescription {
    if (raw == null || (typeof raw === "string" && !raw.trim())) {
      return new EngagementDescription(null);
    }
    const value = raw.trim();
    if (value.length > 5000) {
      throw new EngagementValidationError(
        "Description must be at most 5000 characters.",
      );
    }
    return new EngagementDescription(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: EngagementDescription | null | undefined): boolean {
    return super.equals(other);
  }
}
