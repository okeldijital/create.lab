import { ValueObject } from "@creative-lab/core";
import { EngagementValidationError } from "../errors/EngagementErrors.js";

export class SequenceNumber extends ValueObject<{ value: number }> {
  private constructor(value: number) {
    super({ value });
  }
  static create(raw: number): SequenceNumber {
    if (!Number.isInteger(raw) || raw < 1) {
      throw new EngagementValidationError(
        "Sequence number must be a positive integer.",
      );
    }
    return new SequenceNumber(raw);
  }
  get value(): number {
    return this.props.value;
  }
  override equals(other: SequenceNumber | null | undefined): boolean {
    return super.equals(other);
  }
}
