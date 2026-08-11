import { ValueObject } from "@creative-lab/core";
import { ReviewValidationError } from "../errors/ReviewErrors.js";

export class ReviewTitle extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): ReviewTitle {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) throw new ReviewValidationError("Review title is required.");
    if (value.length > 200) {
      throw new ReviewValidationError(
        "Review title must be at most 200 characters.",
      );
    }
    return new ReviewTitle(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: ReviewTitle | null | undefined): boolean {
    return super.equals(other);
  }
}
