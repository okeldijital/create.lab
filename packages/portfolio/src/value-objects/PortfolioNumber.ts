import { ValueObject } from "@creative-lab/core";
import { PortfolioValidationError } from "../errors/PortfolioErrors.js";

export class PortfolioNumber extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): PortfolioNumber {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new PortfolioValidationError("Portfolio number is required.");
    }
    if (value.length > 64) {
      throw new PortfolioValidationError(
        "Portfolio number must be at most 64 characters.",
      );
    }
    return new PortfolioNumber(value);
  }
  static generate(now: Date = new Date()): PortfolioNumber {
    const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return PortfolioNumber.create(`PFO-${stamp}-${rand}`);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: PortfolioNumber | null | undefined): boolean {
    return super.equals(other);
  }
}
