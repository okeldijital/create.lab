import { ValueObject } from "@creative-lab/core";
import { ReviewValidationError } from "../errors/ReviewErrors.js";

export class ReviewDescription extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): ReviewDescription {
    if (raw === null || raw === undefined || raw.trim() === "") {
      return new ReviewDescription(null);
    }
    const value = raw.trim();
    if (value.length > 5000) {
      throw new ReviewValidationError(
        "Review description must be at most 5000 characters.",
      );
    }
    return new ReviewDescription(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: ReviewDescription | null | undefined): boolean {
    return super.equals(other);
  }
}
