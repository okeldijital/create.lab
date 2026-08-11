import { ValueObject } from "@creative-lab/core";
import { PortfolioValidationError } from "../errors/PortfolioErrors.js";

export class ProgramName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): ProgramName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new PortfolioValidationError("Program name is required.");
    }
    if (value.length > 200) {
      throw new PortfolioValidationError(
        "Program name must be at most 200 characters.",
      );
    }
    return new ProgramName(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: ProgramName | null | undefined): boolean {
    return super.equals(other);
  }
}
