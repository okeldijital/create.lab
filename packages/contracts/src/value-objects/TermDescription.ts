import { ValueObject } from "@creative-lab/core";
import { ContractValidationError } from "../errors/ContractErrors.js";

export class TermDescription extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): TermDescription {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ContractValidationError("Term description is required.");
    }
    if (value.length > 5000) {
      throw new ContractValidationError(
        "Term description must be at most 5000 characters.",
      );
    }
    return new TermDescription(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: TermDescription | null | undefined): boolean {
    return super.equals(other);
  }
}
