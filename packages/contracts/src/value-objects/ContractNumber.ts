import { ValueObject } from "@creative-lab/core";
import { ContractValidationError } from "../errors/ContractErrors.js";

export class ContractNumber extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): ContractNumber {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ContractValidationError("Contract number is required.");
    }
    if (value.length > 64) {
      throw new ContractValidationError(
        "Contract number must be at most 64 characters.",
      );
    }
    return new ContractNumber(value);
  }
  static generate(now: Date = new Date()): ContractNumber {
    const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return ContractNumber.create(`CTR-${stamp}-${rand}`);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: ContractNumber | null | undefined): boolean {
    return super.equals(other);
  }
}
