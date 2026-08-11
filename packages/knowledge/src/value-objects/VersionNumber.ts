import { ValueObject } from "@creative-lab/core";
import { KnowledgeValidationError } from "../errors/KnowledgeErrors.js";

export class VersionNumber extends ValueObject<{ value: number }> {
  private constructor(value: number) {
    super({ value });
  }
  static create(raw: number): VersionNumber {
    if (!Number.isInteger(raw) || raw < 1) {
      throw new KnowledgeValidationError(
        "Version number must be a positive integer.",
      );
    }
    return new VersionNumber(raw);
  }
  get value(): number {
    return this.props.value;
  }
  override equals(other: VersionNumber | null | undefined): boolean {
    return super.equals(other);
  }
}
