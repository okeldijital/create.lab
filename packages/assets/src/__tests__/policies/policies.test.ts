import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { Asset } from "../../aggregates/Asset/Asset.js";
import { AssetCollection } from "../../aggregates/AssetCollection/AssetCollection.js";
import { AssetRelationship } from "../../aggregates/AssetRelationship/AssetRelationship.js";
import { AssetVersion } from "../../aggregates/AssetVersion/AssetVersion.js";
import { AssetType } from "../../enums/AssetType.js";
import { RelationshipType } from "../../enums/RelationshipType.js";
import {
  CircularRelationshipError,
  DuplicateCollectionError,
  DuplicateRelationshipError,
  DuplicateVersionError,
} from "../../errors/AssetErrors.js";
import {
  AssetLifecyclePolicy,
  CollectionPolicy,
  RelationshipPolicy,
  VersionPolicy,
} from "../../policies/index.js";
import { asAssetId, asAssetVersionId } from "../../types/ids.js";

const orgId = asOrganizationId("org-1");

describe("VersionPolicy", () => {
  it("sequential numbering", () => {
    expect(VersionPolicy.nextNumber([]).value).toBe(1);
    const v1 = AssetVersion.create({
      organizationId: orgId,
      assetId: asAssetId("a1"),
      versionNumber: 1,
      checksum: "h1",
      createdBy: "u",
    });
    expect(VersionPolicy.nextNumber([v1]).value).toBe(2);
    expect(() => VersionPolicy.assertSequential([v1], 1)).toThrow(
      DuplicateVersionError,
    );
    expect(() => VersionPolicy.assertSequential([v1], 2)).not.toThrow();
  });
});

describe("AssetLifecyclePolicy", () => {
  it("blocks mutation when archived", () => {
    const asset = Asset.create({
      organizationId: orgId,
      name: "A",
      assetType: AssetType.AUDIO,
      currentVersionId: asAssetVersionId("v1"),
      createdBy: "u",
    });
    asset.archive();
    expect(() => AssetLifecyclePolicy.assertMutable(asset)).toThrow();
  });
});

describe("CollectionPolicy", () => {
  it("unique names", () => {
    const c = AssetCollection.create({
      organizationId: orgId,
      name: "Deliverables",
    });
    expect(() =>
      CollectionPolicy.assertUniqueName([c], "deliverables", orgId),
    ).toThrow(DuplicateCollectionError);
  });
});

describe("RelationshipPolicy", () => {
  it("self and duplicate prevention", () => {
    const a = asAssetId("a");
    expect(() => RelationshipPolicy.assertNotSelf(a, a)).toThrow(
      CircularRelationshipError,
    );
    const r = AssetRelationship.create({
      organizationId: orgId,
      sourceAssetId: asAssetId("s"),
      targetAssetId: asAssetId("t"),
      relationshipType: RelationshipType.DERIVED_FROM,
    });
    expect(() =>
      RelationshipPolicy.assertNoDuplicate(
        [r],
        asAssetId("s"),
        asAssetId("t"),
        RelationshipType.DERIVED_FROM,
      ),
    ).toThrow(DuplicateRelationshipError);
  });

  it("allows different relationship types for same pair", () => {
    const r = AssetRelationship.create({
      organizationId: orgId,
      sourceAssetId: asAssetId("s2"),
      targetAssetId: asAssetId("t2"),
      relationshipType: RelationshipType.DERIVED_FROM,
    });
    expect(() =>
      RelationshipPolicy.assertNoDuplicate(
        [r],
        asAssetId("s2"),
        asAssetId("t2"),
        RelationshipType.RELATED_TO,
      ),
    ).not.toThrow();
  });
});

describe("VersionPolicy uniqueness", () => {
  it("rejects duplicate version numbers", () => {
    const assetId = asAssetId("a-dup");
    const v1 = AssetVersion.create({
      organizationId: orgId,
      assetId,
      versionNumber: 1,
      checksum: "x",
      createdBy: "u",
    });
    expect(() => VersionPolicy.assertUniqueNumber([v1], 1)).toThrow(
      DuplicateVersionError,
    );
  });
});
