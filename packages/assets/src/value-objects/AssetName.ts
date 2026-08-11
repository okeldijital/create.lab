import { ValueObject } from "@creative-lab/core";
import { AssetValidationError } from "../errors/AssetErrors.js";

export class AssetName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): AssetName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) throw new AssetValidationError("Asset name is required.");
    if (value.length > 200) {
      throw new AssetValidationError(
        "Asset name must be at most 200 characters.",
      );
    }
    return new AssetName(value);
  }
  get value(): string {
    return this.props.value;
  }
  equalsIgnoreCase(other: AssetName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
  override equals(other: AssetName | null | undefined): boolean {
    return super.equals(other);
  }
}
