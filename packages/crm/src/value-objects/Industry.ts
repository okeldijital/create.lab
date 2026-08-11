import { ValueObject } from "@creative-lab/core";
import { CRMValidationError } from "../errors/CRMErrors.js";

export class Industry extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): Industry {
    if (raw == null || (typeof raw === "string" && !raw.trim())) {
      return new Industry(null);
    }
    const value = raw.trim();
    if (value.length > 120) {
      throw new CRMValidationError(
        "Industry must be at most 120 characters.",
      );
    }
    return new Industry(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: Industry | null | undefined): boolean {
    return super.equals(other);
  }
}
