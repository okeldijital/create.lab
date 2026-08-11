import { ValueObject } from "@creative-lab/core";
import { PortfolioValidationError } from "../errors/PortfolioErrors.js";

export class PortfolioDescription extends ValueObject<{
  value: string | null;
}> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): PortfolioDescription {
    if (raw == null || (typeof raw === "string" && !raw.trim())) {
      return new PortfolioDescription(null);
    }
    const value = raw.trim();
    if (value.length > 5000) {
      throw new PortfolioValidationError(
        "Description must be at most 5000 characters.",
      );
    }
    return new PortfolioDescription(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: PortfolioDescription | null | undefined): boolean {
    return super.equals(other);
  }
}
