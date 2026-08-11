import { ValueObject } from "@creative-lab/core";
import { DeliveryValidationError } from "../errors/DeliveryErrors.js";

export class PackageName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): PackageName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new DeliveryValidationError("Package name is required.");
    }
    if (value.length > 200) {
      throw new DeliveryValidationError(
        "Package name must be at most 200 characters.",
      );
    }
    return new PackageName(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: PackageName | null | undefined): boolean {
    return super.equals(other);
  }
}
