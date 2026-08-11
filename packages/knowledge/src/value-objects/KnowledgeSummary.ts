import { ValueObject } from "@creative-lab/core";
import { KnowledgeValidationError } from "../errors/KnowledgeErrors.js";

export class KnowledgeSummary extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): KnowledgeSummary {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new KnowledgeValidationError("Version summary is required.");
    }
    if (value.length > 2000) {
      throw new KnowledgeValidationError(
        "Version summary must be at most 2000 characters.",
      );
    }
    return new KnowledgeSummary(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: KnowledgeSummary | null | undefined): boolean {
    return super.equals(other);
  }
}
