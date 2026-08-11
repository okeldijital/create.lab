import { ValueObject } from "@creative-lab/core";
import { OutputVersionConflictError } from "../errors/OperationsErrors.js";

export class OutputVersion extends ValueObject<{ value: number }> {
  private constructor(value: number) {
    super({ value });
  }
  static create(value: number): OutputVersion {
    if (!Number.isInteger(value) || value < 1) {
      throw new OutputVersionConflictError(
        `Output version must be an integer ≥ 1 (received ${value}).`,
      );
    }
    return new OutputVersion(value);
  }
  static first(): OutputVersion {
    return OutputVersion.create(1);
  }
  next(): OutputVersion {
    return OutputVersion.create(this.props.value + 1);
  }
  get value(): number {
    return this.props.value;
  }
  override equals(other: OutputVersion | null | undefined): boolean {
    return super.equals(other);
  }
}
