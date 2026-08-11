import { ValueObject } from "@creative-lab/core";
import { CRMValidationError } from "../errors/CRMErrors.js";

export class OpportunityTitle extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): OpportunityTitle {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new CRMValidationError("Opportunity title is required.");
    }
    if (value.length > 300) {
      throw new CRMValidationError(
        "Opportunity title must be at most 300 characters.",
      );
    }
    return new OpportunityTitle(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: OpportunityTitle | null | undefined): boolean {
    return super.equals(other);
  }
}
