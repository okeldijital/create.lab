import { ValueObject } from "@creative-lab/core";
import { DuplicateRevisionError } from "../errors/ProductionErrors.js";

export class RevisionNumber extends ValueObject<{ value: number }> {
  private constructor(value: number) {
    super({ value });
  }
  static create(value: number): RevisionNumber {
    if (!Number.isInteger(value) || value < 1) {
      throw new DuplicateRevisionError(
        `Revision number must be an integer ≥ 1 (received ${value}).`,
      );
    }
    return new RevisionNumber(value);
  }
  static first(): RevisionNumber {
    return RevisionNumber.create(1);
  }
  next(): RevisionNumber {
    return RevisionNumber.create(this.props.value + 1);
  }
  get value(): number {
    return this.props.value;
  }
  override equals(other: RevisionNumber | null | undefined): boolean {
    return super.equals(other);
  }
}
