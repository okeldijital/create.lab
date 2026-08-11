import { ValueObject } from "@creative-lab/core";
import { CRMValidationError } from "../errors/CRMErrors.js";

/**
 * Estimated opportunity value in integer minor currency units.
 */
export class OpportunityValue extends ValueObject<{ minorUnits: number }> {
  private constructor(minorUnits: number) {
    super({ minorUnits });
  }
  static fromMinorUnits(minorUnits: number): OpportunityValue {
    if (!Number.isFinite(minorUnits) || Number.isNaN(minorUnits)) {
      throw new CRMValidationError(
        "Opportunity value must be a finite number.",
      );
    }
    if (!Number.isInteger(minorUnits)) {
      throw new CRMValidationError(
        "Opportunity value must be an integer (minor units).",
      );
    }
    if (minorUnits < 0) {
      throw new CRMValidationError("Opportunity value must be ≥ 0.");
    }
    return new OpportunityValue(minorUnits);
  }
  static zero(): OpportunityValue {
    return OpportunityValue.fromMinorUnits(0);
  }
  get minorUnits(): number {
    return this.props.minorUnits;
  }
  get isZero(): boolean {
    return this.props.minorUnits === 0;
  }
  override equals(other: OpportunityValue | null | undefined): boolean {
    return super.equals(other);
  }
}
