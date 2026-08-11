import { ValueObject } from "@creative-lab/core";
import { ContractValidationError } from "../errors/ContractErrors.js";

export class ContractTitle extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): ContractTitle {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ContractValidationError("Contract title is required.");
    }
    if (value.length > 300) {
      throw new ContractValidationError(
        "Contract title must be at most 300 characters.",
      );
    }
    return new ContractTitle(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: ContractTitle | null | undefined): boolean {
    return super.equals(other);
  }
}
