import { ValueObject } from "@creative-lab/core";
import { InvalidAllocationPercentageError } from "../errors/AllocationErrors.js";

/** Commitment intensity 1–100 inclusive. */
export class AllocationPercentage extends ValueObject<{ value: number }> {
  private constructor(value: number) {
    super({ value });
  }
  static create(value: number): AllocationPercentage {
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      throw new InvalidAllocationPercentageError(
        `Allocation percentage must be an integer 1–100 (received ${value}).`,
      );
    }
    return new AllocationPercentage(value);
  }
  get value(): number {
    return this.props.value;
  }
  override equals(other: AllocationPercentage | null | undefined): boolean {
    return super.equals(other);
  }
}
