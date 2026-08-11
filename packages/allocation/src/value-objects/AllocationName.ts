import { ValueObject } from "@creative-lab/core";
import { AllocationValidationError } from "../errors/AllocationErrors.js";

export class AllocationName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): AllocationName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new AllocationValidationError("Allocation group name is required.");
    }
    if (value.length > 200) {
      throw new AllocationValidationError(
        "Allocation group name must be at most 200 characters.",
      );
    }
    return new AllocationName(value);
  }
  get value(): string {
    return this.props.value;
  }
  equalsIgnoreCase(other: AllocationName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
  override equals(other: AllocationName | null | undefined): boolean {
    return super.equals(other);
  }
}
