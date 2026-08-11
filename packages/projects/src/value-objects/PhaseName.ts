import { ValueObject } from "@creative-lab/core";
import { ProjectValidationError } from "../errors/ProjectErrors.js";

export class PhaseName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): PhaseName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ProjectValidationError("Phase name is required.");
    }
    if (value.length > 150) {
      throw new ProjectValidationError(
        "Phase name must be at most 150 characters.",
      );
    }
    return new PhaseName(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: PhaseName | null | undefined): boolean {
    return super.equals(other);
  }
}
