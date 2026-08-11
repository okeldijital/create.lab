import { ValueObject } from "@creative-lab/core";
import { InvalidIncidentStateError } from "../errors/OperationsErrors.js";

export class ResolutionNotes extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): ResolutionNotes {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new InvalidIncidentStateError("Resolution notes are required.");
    }
    if (value.length > 2000) {
      throw new InvalidIncidentStateError(
        "Resolution notes must be at most 2000 characters.",
      );
    }
    return new ResolutionNotes(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: ResolutionNotes | null | undefined): boolean {
    return super.equals(other);
  }
}
