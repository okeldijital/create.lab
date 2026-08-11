import { ValueObject } from "@creative-lab/core";
import { ServicesValidationError } from "../errors/ServicesErrors.js";

export class PriceBookName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): PriceBookName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ServicesValidationError("Price book name is required.");
    }
    if (value.length > 200) {
      throw new ServicesValidationError(
        "Price book name must be at most 200 characters.",
      );
    }
    return new PriceBookName(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: PriceBookName | null | undefined): boolean {
    return super.equals(other);
  }
}
