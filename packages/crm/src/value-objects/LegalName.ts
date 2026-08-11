import { ValueObject } from "@creative-lab/core";
import { CRMValidationError } from "../errors/CRMErrors.js";

export class LegalName extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): LegalName {
    if (raw == null || (typeof raw === "string" && !raw.trim())) {
      return new LegalName(null);
    }
    const value = raw.trim();
    if (value.length > 300) {
      throw new CRMValidationError(
        "Legal name must be at most 300 characters.",
      );
    }
    return new LegalName(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  get isEmpty(): boolean {
    return this.props.value == null;
  }
  override equals(other: LegalName | null | undefined): boolean {
    return super.equals(other);
  }
}
