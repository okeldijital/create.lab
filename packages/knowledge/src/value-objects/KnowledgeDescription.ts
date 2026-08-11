import { ValueObject } from "@creative-lab/core";
import { KnowledgeValidationError } from "../errors/KnowledgeErrors.js";

export class KnowledgeDescription extends ValueObject<{
  value: string | null;
}> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): KnowledgeDescription {
    if (raw == null || (typeof raw === "string" && !raw.trim())) {
      return new KnowledgeDescription(null);
    }
    const value = raw.trim();
    if (value.length > 5000) {
      throw new KnowledgeValidationError(
        "Description must be at most 5000 characters.",
      );
    }
    return new KnowledgeDescription(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: KnowledgeDescription | null | undefined): boolean {
    return super.equals(other);
  }
}
