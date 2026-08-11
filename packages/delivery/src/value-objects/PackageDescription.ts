import { ValueObject } from "@creative-lab/core";
import { DeliveryValidationError } from "../errors/DeliveryErrors.js";

export class PackageDescription extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): PackageDescription {
    if (raw === null || raw === undefined || raw.trim() === "") {
      return new PackageDescription(null);
    }
    const value = raw.trim();
    if (value.length > 5000) {
      throw new DeliveryValidationError(
        "Package description must be at most 5000 characters.",
      );
    }
    return new PackageDescription(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: PackageDescription | null | undefined): boolean {
    return super.equals(other);
  }
}
