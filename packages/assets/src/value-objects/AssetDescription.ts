import { ValueObject } from "@creative-lab/core";
import { AssetValidationError } from "../errors/AssetErrors.js";

export class AssetDescription extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): AssetDescription {
    if (raw === null || raw === undefined || raw.trim() === "") {
      return new AssetDescription(null);
    }
    const value = raw.trim();
    if (value.length > 5000) {
      throw new AssetValidationError(
        "Asset description must be at most 5000 characters.",
      );
    }
    return new AssetDescription(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: AssetDescription | null | undefined): boolean {
    return super.equals(other);
  }
}
