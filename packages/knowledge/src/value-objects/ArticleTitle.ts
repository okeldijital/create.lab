import { ValueObject } from "@creative-lab/core";
import { KnowledgeValidationError } from "../errors/KnowledgeErrors.js";

export class ArticleTitle extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): ArticleTitle {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new KnowledgeValidationError("Article title is required.");
    }
    if (value.length > 300) {
      throw new KnowledgeValidationError(
        "Article title must be at most 300 characters.",
      );
    }
    return new ArticleTitle(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: ArticleTitle | null | undefined): boolean {
    return super.equals(other);
  }
}
