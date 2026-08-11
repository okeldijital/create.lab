import { ValueObject } from "@creative-lab/core";
import { ReviewValidationError } from "../errors/ReviewErrors.js";

/** Opaque reviewer identity (user/worker id). */
export class ReviewerReference extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): ReviewerReference {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ReviewValidationError("Reviewer reference is required.");
    }
    if (value.length > 100) {
      throw new ReviewValidationError(
        "Reviewer reference must be at most 100 characters.",
      );
    }
    return new ReviewerReference(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: ReviewerReference | null | undefined): boolean {
    return super.equals(other);
  }
}
