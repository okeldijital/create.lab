import { ValueObject } from "@creative-lab/core";
import { AssetValidationError } from "../errors/AssetErrors.js";

export class RelationshipLabel extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): RelationshipLabel {
    if (raw === null || raw === undefined || raw.trim() === "") {
      return new RelationshipLabel(null);
    }
    const value = raw.trim();
    if (value.length > 200) {
      throw new AssetValidationError(
        "Relationship label must be at most 200 characters.",
      );
    }
    return new RelationshipLabel(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: RelationshipLabel | null | undefined): boolean {
    return super.equals(other);
  }
}
