import { ValueObject } from "@creative-lab/core";
import { ContractValidationError } from "../errors/ContractErrors.js";

export class TermTitle extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): TermTitle {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ContractValidationError("Term title is required.");
    }
    if (value.length > 200) {
      throw new ContractValidationError(
        "Term title must be at most 200 characters.",
      );
    }
    return new TermTitle(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: TermTitle | null | undefined): boolean {
    return super.equals(other);
  }
}
