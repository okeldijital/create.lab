import { ValueObject } from "@creative-lab/core";
import { KnowledgeValidationError } from "../errors/KnowledgeErrors.js";

export class ArticleNumber extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): ArticleNumber {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new KnowledgeValidationError("Article number is required.");
    }
    if (value.length > 64) {
      throw new KnowledgeValidationError(
        "Article number must be at most 64 characters.",
      );
    }
    return new ArticleNumber(value);
  }
  static generate(now: Date = new Date()): ArticleNumber {
    const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return ArticleNumber.create(`KNW-${stamp}-${rand}`);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: ArticleNumber | null | undefined): boolean {
    return super.equals(other);
  }
}
