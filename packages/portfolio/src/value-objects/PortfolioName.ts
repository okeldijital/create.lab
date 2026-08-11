import { ValueObject } from "@creative-lab/core";
import { PortfolioValidationError } from "../errors/PortfolioErrors.js";

export class PortfolioName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): PortfolioName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new PortfolioValidationError("Portfolio name is required.");
    }
    if (value.length > 200) {
      throw new PortfolioValidationError(
        "Portfolio name must be at most 200 characters.",
      );
    }
    return new PortfolioName(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: PortfolioName | null | undefined): boolean {
    return super.equals(other);
  }
}
