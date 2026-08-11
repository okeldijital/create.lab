import { ValueObject } from "@creative-lab/core";
import { AllocationValidationError } from "../errors/AllocationErrors.js";

export class AllocationNotes extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): AllocationNotes {
    if (raw === null || raw === undefined || raw.trim() === "") {
      return new AllocationNotes(null);
    }
    const value = raw.trim();
    if (value.length > 2000) {
      throw new AllocationValidationError(
        "Allocation notes must be at most 2000 characters.",
      );
    }
    return new AllocationNotes(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: AllocationNotes | null | undefined): boolean {
    return super.equals(other);
  }
}
