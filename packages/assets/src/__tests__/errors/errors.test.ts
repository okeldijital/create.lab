import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  AssetNotFoundError,
  AssetValidationError,
  AssetVersionNotFoundError,
  CircularRelationshipError,
  CollectionNotFoundError,
  CurrentVersionError,
  DuplicateAssetError,
  DuplicateCollectionError,
  DuplicateRelationshipError,
  DuplicateVersionError,
  InvalidAssetStateError,
  InvalidVersionError,
  RelationshipError,
} from "../../errors/AssetErrors.js";

describe("Error model", () => {
  it("extends DomainError with codes", () => {
    const cases: DomainError[] = [
      new AssetNotFoundError("x"),
      new DuplicateAssetError("d"),
      new DuplicateVersionError("v"),
      new InvalidVersionError("i"),
      new CurrentVersionError("c"),
      new CollectionNotFoundError("col"),
      new DuplicateCollectionError("n", "org"),
      new RelationshipError("r"),
      new DuplicateRelationshipError("dr"),
      new CircularRelationshipError("cr"),
      new AssetVersionNotFoundError("vn"),
      new InvalidAssetStateError("s"),
      new AssetValidationError("val"),
    ];
    for (const err of cases) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBeTruthy();
    }
  });
});
