import { ValueObject } from "@creative-lab/core";
import { ProductionValidationError } from "../errors/ProductionErrors.js";

export class MilestoneName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): MilestoneName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ProductionValidationError("Milestone name is required.");
    }
    if (value.length > 150) {
      throw new ProductionValidationError(
        "Milestone name must be at most 150 characters.",
      );
    }
    return new MilestoneName(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: MilestoneName | null | undefined): boolean {
    return super.equals(other);
  }
}
