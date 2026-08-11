import { ValueObject } from "@creative-lab/core";
import { ContractValidationError } from "../errors/ContractErrors.js";

export class AmendmentReason extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): AmendmentReason {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ContractValidationError("Amendment reason is required.");
    }
    if (value.length > 2000) {
      throw new ContractValidationError(
        "Amendment reason must be at most 2000 characters.",
      );
    }
    return new AmendmentReason(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: AmendmentReason | null | undefined): boolean {
    return super.equals(other);
  }
}
