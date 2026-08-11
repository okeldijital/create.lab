import { ValueObject } from "@creative-lab/core";
import { AssetValidationError } from "../errors/AssetErrors.js";

/**
 * Opaque integrity fingerprint — not a file path.
 * Assets never store binary content or storage locations.
 */
export class Checksum extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): Checksum {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) throw new AssetValidationError("Checksum is required.");
    if (value.length > 128) {
      throw new AssetValidationError(
        "Checksum must be at most 128 characters.",
      );
    }
    // Reject path-like values
    if (value.includes("/") || value.includes("\\") || value.includes(":")) {
      throw new AssetValidationError(
        "Checksum must not look like a file path.",
      );
    }
    return new Checksum(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: Checksum | null | undefined): boolean {
    return super.equals(other);
  }
}
