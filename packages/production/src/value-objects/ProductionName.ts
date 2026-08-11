import { ValueObject } from "@creative-lab/core";
import { ProductionValidationError } from "../errors/ProductionErrors.js";

export class ProductionName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): ProductionName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ProductionValidationError("Production name is required.");
    }
    if (value.length > 200) {
      throw new ProductionValidationError(
        "Production name must be at most 200 characters.",
      );
    }
    return new ProductionName(value);
  }
  get value(): string {
    return this.props.value;
  }
  equalsIgnoreCase(other: ProductionName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
  override equals(other: ProductionName | null | undefined): boolean {
    return super.equals(other);
  }
}
