import { ValueObject } from "@creative-lab/core";
import { ReviewValidationError } from "../errors/ReviewErrors.js";

/** Count of completed approvals (≥ 0). */
export class ApprovalCount extends ValueObject<{ value: number }> {
  private constructor(value: number) {
    super({ value });
  }
  static create(value: number): ApprovalCount {
    if (!Number.isInteger(value) || value < 0) {
      throw new ReviewValidationError(
        `Approval count must be an integer ≥ 0 (received ${value}).`,
      );
    }
    return new ApprovalCount(value);
  }
  static zero(): ApprovalCount {
    return ApprovalCount.create(0);
  }
  increment(): ApprovalCount {
    return ApprovalCount.create(this.props.value + 1);
  }
  get value(): number {
    return this.props.value;
  }
  meets(required: number): boolean {
    return this.props.value >= required;
  }
  override equals(other: ApprovalCount | null | undefined): boolean {
    return super.equals(other);
  }
}
