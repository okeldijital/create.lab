import { ValueObject } from "@creative-lab/core";
import { KnowledgeValidationError } from "../errors/KnowledgeErrors.js";

export class ReferenceLabel extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): ReferenceLabel {
    if (raw == null || (typeof raw === "string" && !raw.trim())) {
      return new ReferenceLabel(null);
    }
    const value = raw.trim();
    if (value.length > 200) {
      throw new KnowledgeValidationError(
        "Reference label must be at most 200 characters.",
      );
    }
    return new ReferenceLabel(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: ReferenceLabel | null | undefined): boolean {
    return super.equals(other);
  }
}
