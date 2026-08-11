import { ValueObject } from "@creative-lab/core";
import { ProductionValidationError } from "../errors/ProductionErrors.js";

export class SessionNotes extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): SessionNotes {
    if (raw === null || raw === undefined || raw.trim() === "") {
      return new SessionNotes(null);
    }
    const value = raw.trim();
    if (value.length > 2000) {
      throw new ProductionValidationError(
        "Session notes must be at most 2000 characters.",
      );
    }
    return new SessionNotes(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: SessionNotes | null | undefined): boolean {
    return super.equals(other);
  }
}
