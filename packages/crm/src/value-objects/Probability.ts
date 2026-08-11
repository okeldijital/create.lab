import { ValueObject } from "@creative-lab/core";
import { CRMValidationError } from "../errors/CRMErrors.js";

/** Win probability 0–100 inclusive. */
export class Probability extends ValueObject<{ value: number }> {
  private constructor(value: number) {
    super({ value });
  }
  static create(raw: number): Probability {
    if (!Number.isFinite(raw) || Number.isNaN(raw)) {
      throw new CRMValidationError("Probability must be a finite number.");
    }
    if (!Number.isInteger(raw)) {
      throw new CRMValidationError("Probability must be an integer 0–100.");
    }
    if (raw < 0 || raw > 100) {
      throw new CRMValidationError("Probability must be between 0 and 100.");
    }
    return new Probability(raw);
  }
  get value(): number {
    return this.props.value;
  }
  override equals(other: Probability | null | undefined): boolean {
    return super.equals(other);
  }
}
