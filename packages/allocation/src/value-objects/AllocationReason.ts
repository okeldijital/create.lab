import { ValueObject } from "@creative-lab/core";
import { AllocationValidationError } from "../errors/AllocationErrors.js";

export class AllocationReason extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): AllocationReason {
    if (raw === null || raw === undefined || raw.trim() === "") {
      return new AllocationReason(null);
    }
    const value = raw.trim();
    if (value.length > 500) {
      throw new AllocationValidationError(
        "Allocation reason must be at most 500 characters.",
      );
    }
    return new AllocationReason(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: AllocationReason | null | undefined): boolean {
    return super.equals(other);
  }
}
