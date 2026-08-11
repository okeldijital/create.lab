import { ValueObject } from "@creative-lab/core";
import { PortfolioValidationError } from "../errors/PortfolioErrors.js";

export class InitiativeTitle extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): InitiativeTitle {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new PortfolioValidationError("Initiative title is required.");
    }
    if (value.length > 300) {
      throw new PortfolioValidationError(
        "Initiative title must be at most 300 characters.",
      );
    }
    return new InitiativeTitle(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: InitiativeTitle | null | undefined): boolean {
    return super.equals(other);
  }
}
