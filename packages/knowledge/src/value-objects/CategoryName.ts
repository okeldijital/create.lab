import { ValueObject } from "@creative-lab/core";
import { KnowledgeValidationError } from "../errors/KnowledgeErrors.js";

export class CategoryName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): CategoryName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new KnowledgeValidationError("Category name is required.");
    }
    if (value.length > 120) {
      throw new KnowledgeValidationError(
        "Category name must be at most 120 characters.",
      );
    }
    return new CategoryName(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: CategoryName | null | undefined): boolean {
    return super.equals(other);
  }
}
