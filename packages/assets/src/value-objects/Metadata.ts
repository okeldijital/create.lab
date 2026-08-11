import { ValueObject } from "@creative-lab/core";
import { AssetValidationError } from "../errors/AssetErrors.js";

/**
 * Immutable metadata map. No file paths or binary content.
 */
export class Metadata extends ValueObject<{
  entries: Readonly<Record<string, string | number | boolean | null>>;
}> {
  private constructor(
    entries: Readonly<Record<string, string | number | boolean | null>>,
  ) {
    super({ entries });
  }
  static empty(): Metadata {
    return new Metadata({});
  }
  static create(
    raw: Record<string, string | number | boolean | null> | null | undefined,
  ): Metadata {
    if (raw === null || raw === undefined) return Metadata.empty();
    const entries: Record<string, string | number | boolean | null> = {};
    for (const [k, v] of Object.entries(raw)) {
      const key = k.trim();
      if (!key) {
        throw new AssetValidationError("Metadata keys cannot be empty.");
      }
      if (key.length > 100) {
        throw new AssetValidationError(
          "Metadata keys must be at most 100 characters.",
        );
      }
      if (
        typeof v === "string" &&
        (v.includes("://") ||
          v.startsWith("/") ||
          v.startsWith("./") ||
          v.includes("\\"))
      ) {
        throw new AssetValidationError(
          "Metadata must not contain file paths or storage URLs.",
        );
      }
      entries[key] = v;
    }
    const json = JSON.stringify(entries);
    if (json.length > 10_000) {
      throw new AssetValidationError(
        "Metadata payload must be at most 10000 characters when serialized.",
      );
    }
    return new Metadata(Object.freeze({ ...entries }));
  }
  get entries(): Readonly<Record<string, string | number | boolean | null>> {
    return this.props.entries;
  }
  get(key: string): string | number | boolean | null | undefined {
    return this.props.entries[key];
  }
  override equals(other: Metadata | null | undefined): boolean {
    return super.equals(other);
  }
}
