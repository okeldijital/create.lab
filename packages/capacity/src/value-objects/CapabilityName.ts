import { ValueObject } from "@creative-lab/core";
import { CapacityProfileValidationError } from "../errors/CapacityErrors.js";

export class CapabilityName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): CapabilityName {
    if (typeof raw !== "string") {
      throw new CapacityProfileValidationError(
        "Capability name must be a string.",
      );
    }
    const value = raw.trim();
    if (!value) {
      throw new CapacityProfileValidationError("Capability name is required.");
    }
    if (value.length > 120) {
      throw new CapacityProfileValidationError(
        "Capability name must be at most 120 characters.",
      );
    }
    return new CapabilityName(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: CapabilityName | null | undefined): boolean {
    if (other == null || !(other instanceof CapabilityName)) return false;
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
