import { ValueObject } from "@creative-lab/core";
import { ReviewValidationError } from "../errors/ReviewErrors.js";

export class DecisionNotes extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): DecisionNotes {
    if (raw === null || raw === undefined || raw.trim() === "") {
      return new DecisionNotes(null);
    }
    const value = raw.trim();
    if (value.length > 2000) {
      throw new ReviewValidationError(
        "Decision notes must be at most 2000 characters.",
      );
    }
    return new DecisionNotes(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: DecisionNotes | null | undefined): boolean {
    return super.equals(other);
  }
}
