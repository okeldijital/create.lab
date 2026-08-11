import { ValueObject } from "@creative-lab/core";
import { ServicesValidationError } from "../errors/ServicesErrors.js";

export class ServiceCode extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): ServiceCode {
    const value = typeof raw === "string" ? raw.trim().toUpperCase() : "";
    if (!value) {
      throw new ServicesValidationError("Service code is required.");
    }
    if (value.length > 64) {
      throw new ServicesValidationError(
        "Service code must be at most 64 characters.",
      );
    }
    if (!/^[A-Z0-9][A-Z0-9_-]*$/.test(value)) {
      throw new ServicesValidationError(
        "Service code must be alphanumeric (with _ or -).",
      );
    }
    return new ServiceCode(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: ServiceCode | null | undefined): boolean {
    return super.equals(other);
  }
}
