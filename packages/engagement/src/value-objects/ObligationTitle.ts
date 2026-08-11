import { ValueObject } from "@creative-lab/core";
import { EngagementValidationError } from "../errors/EngagementErrors.js";

export class ObligationTitle extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): ObligationTitle {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new EngagementValidationError("Obligation title is required.");
    }
    if (value.length > 300) {
      throw new EngagementValidationError(
        "Obligation title must be at most 300 characters.",
      );
    }
    return new ObligationTitle(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: ObligationTitle | null | undefined): boolean {
    return super.equals(other);
  }
}
