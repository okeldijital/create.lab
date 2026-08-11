import { ValueObject } from "@creative-lab/core";
import { OperationsValidationError } from "../errors/OperationsErrors.js";

export class WorkDescription extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): WorkDescription {
    if (raw === null || raw === undefined || raw.trim() === "") {
      return new WorkDescription(null);
    }
    const value = raw.trim();
    if (value.length > 5000) {
      throw new OperationsValidationError(
        "Work description must be at most 5000 characters.",
      );
    }
    return new WorkDescription(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: WorkDescription | null | undefined): boolean {
    return super.equals(other);
  }
}
