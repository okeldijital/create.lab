import { ValueObject } from "@creative-lab/core";
import { ReviewValidationError } from "../errors/ReviewErrors.js";

/** Number of approvals required to complete (≥ 1). */
export class ApprovalRequirement extends ValueObject<{ value: number }> {
  private constructor(value: number) {
    super({ value });
  }
  static create(value: number): ApprovalRequirement {
    if (!Number.isInteger(value) || value < 1) {
      throw new ReviewValidationError(
        `Required approvals must be an integer ≥ 1 (received ${value}).`,
      );
    }
    if (value > 100) {
      throw new ReviewValidationError(
        "Required approvals must be at most 100.",
      );
    }
    return new ApprovalRequirement(value);
  }
  get value(): number {
    return this.props.value;
  }
  override equals(other: ApprovalRequirement | null | undefined): boolean {
    return super.equals(other);
  }
}
