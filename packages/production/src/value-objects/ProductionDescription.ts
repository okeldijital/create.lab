import { ValueObject } from "@creative-lab/core";
import { ProductionValidationError } from "../errors/ProductionErrors.js";

export class ProductionDescription extends ValueObject<{
  value: string | null;
}> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): ProductionDescription {
    if (raw === null || raw === undefined || raw.trim() === "") {
      return new ProductionDescription(null);
    }
    const value = raw.trim();
    if (value.length > 5000) {
      throw new ProductionValidationError(
        "Production description must be at most 5000 characters.",
      );
    }
    return new ProductionDescription(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: ProductionDescription | null | undefined): boolean {
    return super.equals(other);
  }
}
