import { describe, expect, it } from "vitest";
import {
  AssetValidationError,
  InvalidVersionError,
} from "../../errors/AssetErrors.js";
import { AssetDescription } from "../../value-objects/AssetDescription.js";
import { AssetName } from "../../value-objects/AssetName.js";
import { Checksum } from "../../value-objects/Checksum.js";
import { CollectionName } from "../../value-objects/CollectionName.js";
import { Metadata } from "../../value-objects/Metadata.js";
import { RelationshipLabel } from "../../value-objects/RelationshipLabel.js";
import { VersionNumber } from "../../value-objects/VersionNumber.js";

describe("Value objects", () => {
  it("AssetName required", () => {
    expect(() => AssetName.create("")).toThrow(AssetValidationError);
    expect(AssetName.create("  Mix  ").value).toBe("Mix");
  });

  it("AssetDescription optional", () => {
    expect(AssetDescription.create(null).value).toBeNull();
  });

  it("VersionNumber ≥1 integer", () => {
    expect(VersionNumber.first().next().value).toBe(2);
    expect(() => VersionNumber.create(0)).toThrow(InvalidVersionError);
  });

  it("Checksum rejects paths", () => {
    expect(Checksum.create("deadbeef").value).toBe("deadbeef");
    expect(() => Checksum.create("/tmp/file.wav")).toThrow(
      AssetValidationError,
    );
    expect(() => Checksum.create("C:\\file")).toThrow(AssetValidationError);
  });

  it("CollectionName required", () => {
    expect(CollectionName.create("Album").value).toBe("Album");
    expect(() => CollectionName.create("")).toThrow(AssetValidationError);
  });

  it("Metadata rejects path-like values", () => {
    expect(Metadata.create({ format: "wav" }).get("format")).toBe("wav");
    expect(() => Metadata.create({ path: "/files/x" })).toThrow(
      AssetValidationError,
    );
    expect(() => Metadata.create({ url: "s3://bucket/key" })).toThrow(
      AssetValidationError,
    );
  });

  it("RelationshipLabel optional", () => {
    expect(RelationshipLabel.create(null).value).toBeNull();
    expect(RelationshipLabel.create("preview").value).toBe("preview");
  });

  it("value equality", () => {
    expect(VersionNumber.create(3).equals(VersionNumber.create(3))).toBe(true);
  });

  it("Metadata empty factory", () => {
    expect(Metadata.empty().entries).toEqual({});
  });

  it("Checksum required non-empty", () => {
    expect(() => Checksum.create("  ")).toThrow(AssetValidationError);
  });

  it("AssetName case-insensitive equality helper", () => {
    const a = AssetName.create("Master");
    const b = AssetName.create("master");
    expect(a.equalsIgnoreCase(b)).toBe(true);
  });
});
