import { ValueObject } from "@creative-lab/core";
import { OperationsValidationError } from "../errors/OperationsErrors.js";

export class OutputName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): OutputName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) throw new OperationsValidationError("Output name is required.");
    if (value.length > 200) {
      throw new OperationsValidationError(
        "Output name must be at most 200 characters.",
      );
    }
    return new OutputName(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: OutputName | null | undefined): boolean {
    return super.equals(other);
  }
}
