import { ValueObject } from "@creative-lab/core";
import { OperationsValidationError } from "../errors/OperationsErrors.js";

export class WorkTitle extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): WorkTitle {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) throw new OperationsValidationError("Work title is required.");
    if (value.length > 200) {
      throw new OperationsValidationError(
        "Work title must be at most 200 characters.",
      );
    }
    return new WorkTitle(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: WorkTitle | null | undefined): boolean {
    return super.equals(other);
  }
}
