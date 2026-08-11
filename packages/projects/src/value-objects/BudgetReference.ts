import { ValueObject } from "@creative-lab/core";
import { ProjectValidationError } from "../errors/ProjectErrors.js";

/** Opaque external budget/cost-center reference — projects do not own billing. */
export class BudgetReference extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): BudgetReference {
    if (raw === null || raw === undefined || raw.trim() === "") {
      return new BudgetReference(null);
    }
    const value = raw.trim();
    if (value.length > 100) {
      throw new ProjectValidationError(
        "Budget reference must be at most 100 characters.",
      );
    }
    return new BudgetReference(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: BudgetReference | null | undefined): boolean {
    return super.equals(other);
  }
}
