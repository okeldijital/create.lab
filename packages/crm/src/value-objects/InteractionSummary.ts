import { ValueObject } from "@creative-lab/core";
import { CRMValidationError } from "../errors/CRMErrors.js";

export class InteractionSummary extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): InteractionSummary {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new CRMValidationError("Interaction summary is required.");
    }
    if (value.length > 2000) {
      throw new CRMValidationError(
        "Interaction summary must be at most 2000 characters.",
      );
    }
    return new InteractionSummary(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: InteractionSummary | null | undefined): boolean {
    return super.equals(other);
  }
}
