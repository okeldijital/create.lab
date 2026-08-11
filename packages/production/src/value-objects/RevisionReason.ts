import { ValueObject } from "@creative-lab/core";
import { ProductionValidationError } from "../errors/ProductionErrors.js";

export class RevisionReason extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): RevisionReason {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ProductionValidationError("Revision reason is required.");
    }
    if (value.length > 2000) {
      throw new ProductionValidationError(
        "Revision reason must be at most 2000 characters.",
      );
    }
    return new RevisionReason(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: RevisionReason | null | undefined): boolean {
    return super.equals(other);
  }
}
