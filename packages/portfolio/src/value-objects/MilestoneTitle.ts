import { ValueObject } from "@creative-lab/core";
import { PortfolioValidationError } from "../errors/PortfolioErrors.js";

export class MilestoneTitle extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): MilestoneTitle {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new PortfolioValidationError("Milestone title is required.");
    }
    if (value.length > 300) {
      throw new PortfolioValidationError(
        "Milestone title must be at most 300 characters.",
      );
    }
    return new MilestoneTitle(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: MilestoneTitle | null | undefined): boolean {
    return super.equals(other);
  }
}
