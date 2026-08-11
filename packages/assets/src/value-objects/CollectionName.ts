import { ValueObject } from "@creative-lab/core";
import { AssetValidationError } from "../errors/AssetErrors.js";

export class CollectionName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): CollectionName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new AssetValidationError("Collection name is required.");
    }
    if (value.length > 200) {
      throw new AssetValidationError(
        "Collection name must be at most 200 characters.",
      );
    }
    return new CollectionName(value);
  }
  get value(): string {
    return this.props.value;
  }
  equalsIgnoreCase(other: CollectionName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
  override equals(other: CollectionName | null | undefined): boolean {
    return super.equals(other);
  }
}
