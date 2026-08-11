import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { asProductionId } from "@creative-lab/production";
import { asProjectId } from "@creative-lab/projects";
import { Asset } from "../../aggregates/Asset/Asset.js";
import { AssetCollection } from "../../aggregates/AssetCollection/AssetCollection.js";
import { AssetRelationship } from "../../aggregates/AssetRelationship/AssetRelationship.js";
import { AssetVersion } from "../../aggregates/AssetVersion/AssetVersion.js";
import { AssetStatus } from "../../enums/AssetStatus.js";
import { AssetType } from "../../enums/AssetType.js";
import { AssetVersionStatus } from "../../enums/AssetVersionStatus.js";
import { RelationshipType } from "../../enums/RelationshipType.js";
import {
  CircularRelationshipError,
  InvalidAssetStateError,
} from "../../errors/AssetErrors.js";
import {
  AssetArchived,
  AssetCreated,
  AssetRestored,
  AssetVersionCreated,
  CollectionCreated,
  RelationshipCreated,
} from "../../events/asset-events.js";
import { asAssetId, asAssetVersionId } from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const productionId = asProductionId("prod-1");

describe("AssetVersion aggregate", () => {
  it("creates immutable version with event", () => {
    const assetId = asAssetId("asset-1");
    const v = AssetVersion.create({
      organizationId: orgId,
      assetId,
      versionNumber: 1,
      checksum: "abc123def",
      createdBy: "user-1",
      metadata: { format: "wav", sampleRate: 48000 },
    });
    expect(v.versionNumber.value).toBe(1);
    expect(v.checksum.value).toBe("abc123def");
    expect(v.status).toBe(AssetVersionStatus.CURRENT);
    expect(v.pullDomainEvents()[0]).toBeInstanceOf(AssetVersionCreated);
  });

  it("can supersede and remake current without changing checksum", () => {
    const v = AssetVersion.create({
      organizationId: orgId,
      assetId: asAssetId("a1"),
      versionNumber: 1,
      checksum: "hash1",
      createdBy: "u1",
    });
    const checksum = v.checksum.value;
    v.markSuperseded();
    expect(v.status).toBe(AssetVersionStatus.SUPERSEDED);
    expect(v.checksum.value).toBe(checksum);
    v.markCurrent();
    expect(v.isCurrent).toBe(true);
  });
});

describe("Asset aggregate", () => {
  it("creates with current version and event", () => {
    const versionId = asAssetVersionId("v1");
    const asset = Asset.create({
      organizationId: orgId,
      projectId,
      productionId,
      name: "Master Track",
      assetType: AssetType.MASTER,
      currentVersionId: versionId,
      createdBy: "engineer",
    });
    expect(asset.status).toBe(AssetStatus.ACTIVE);
    expect(asset.currentVersionId).toBe(versionId);
    expect(asset.pullDomainEvents()[0]).toBeInstanceOf(AssetCreated);
  });

  it("archives and restores", () => {
    const asset = Asset.create({
      organizationId: orgId,
      name: "Mix",
      assetType: AssetType.MIX,
      currentVersionId: asAssetVersionId("v1"),
      createdBy: "u1",
    });
    asset.pullDomainEvents();
    asset.archive();
    expect(asset.isArchived).toBe(true);
    expect(asset.pullDomainEvents()[0]).toBeInstanceOf(AssetArchived);
    expect(() => asset.rename("X")).toThrow(InvalidAssetStateError);
    asset.restore();
    expect(asset.status).toBe(AssetStatus.ACTIVE);
    expect(asset.pullDomainEvents()[0]).toBeInstanceOf(AssetRestored);
  });

  it("promotes version", () => {
    const asset = Asset.create({
      organizationId: orgId,
      name: "Artwork",
      assetType: AssetType.ARTWORK,
      currentVersionId: asAssetVersionId("v1"),
      createdBy: "u1",
    });
    asset.pullDomainEvents();
    asset.promoteVersion(asAssetVersionId("v2"), asAssetVersionId("v1"));
    expect(asset.currentVersionId).toBe(asAssetVersionId("v2"));
  });

  it("requires current version", () => {
    expect(() =>
      Asset.create({
        organizationId: orgId,
        name: "X",
        assetType: AssetType.AUDIO,
        currentVersionId: "" as never,
        createdBy: "u1",
      }),
    ).toThrow();
  });
});

describe("AssetCollection aggregate", () => {
  it("creates and manages assets", () => {
    const c = AssetCollection.create({
      organizationId: orgId,
      name: "Album",
      description: "Tracks",
    });
    expect(c.pullDomainEvents()[0]).toBeInstanceOf(CollectionCreated);
    const aid = asAssetId("a1");
    c.addAsset(aid);
    expect(c.contains(aid)).toBe(true);
    c.removeAsset(aid);
    expect(c.contains(aid)).toBe(false);
  });

  it("archived collection immutable", () => {
    const c = AssetCollection.create({
      organizationId: orgId,
      name: "Stems",
    });
    c.archive();
    expect(() => c.rename("X")).toThrow(InvalidAssetStateError);
  });
});

describe("AssetRelationship aggregate", () => {
  it("creates directed relationship", () => {
    const r = AssetRelationship.create({
      organizationId: orgId,
      sourceAssetId: asAssetId("mix"),
      targetAssetId: asAssetId("master"),
      relationshipType: RelationshipType.DERIVED_FROM,
    });
    expect(r.pullDomainEvents()[0]).toBeInstanceOf(RelationshipCreated);
  });

  it("prohibits self reference", () => {
    const id = asAssetId("same");
    expect(() =>
      AssetRelationship.create({
        organizationId: orgId,
        sourceAssetId: id,
        targetAssetId: id,
        relationshipType: RelationshipType.RELATED_TO,
      }),
    ).toThrow(CircularRelationshipError);
  });

  it("remove is one-shot", () => {
    const r = AssetRelationship.create({
      organizationId: orgId,
      sourceAssetId: asAssetId("a"),
      targetAssetId: asAssetId("b"),
      relationshipType: RelationshipType.CONTAINS,
    });
    r.remove();
    expect(r.removed).toBe(true);
    expect(() => r.remove()).toThrow();
  });

  it("reconstitutes asset and version snapshots", () => {
    const versionId = asAssetVersionId("v1");
    const asset = Asset.create({
      organizationId: orgId,
      name: "Stem Bundle",
      assetType: AssetType.STEM,
      currentVersionId: versionId,
      createdBy: "u",
    });
    const restored = Asset.reconstitute(asset.toSnapshot());
    expect(restored.id).toBe(asset.id);
    expect(restored.assetType).toBe(AssetType.STEM);

    const v = AssetVersion.create({
      organizationId: orgId,
      assetId: asset.id,
      versionNumber: 1,
      checksum: "snap",
      createdBy: "u",
    });
    const vr = AssetVersion.reconstitute(v.toSnapshot());
    expect(vr.checksum.value).toBe("snap");
  });

  it("updateDescription on active asset", () => {
    const asset = Asset.create({
      organizationId: orgId,
      name: "Doc",
      assetType: AssetType.DOCUMENT,
      currentVersionId: asAssetVersionId("v1"),
      createdBy: "u",
    });
    asset.updateDescription("notes");
    expect(asset.description.value).toBe("notes");
  });

  it("collection reconstitute and contains", () => {
    const c = AssetCollection.create({
      organizationId: orgId,
      name: "Deliverables",
      assetIds: [asAssetId("a1"), asAssetId("a2")],
    });
    expect(c.assetIds).toHaveLength(2);
    const r = AssetCollection.reconstitute(c.toSnapshot());
    expect(r.name.value).toBe("Deliverables");
    expect(r.contains(asAssetId("a1"))).toBe(true);
  });

  it("relationship matches and reconstitute", () => {
    const r = AssetRelationship.create({
      organizationId: orgId,
      sourceAssetId: asAssetId("mix"),
      targetAssetId: asAssetId("rec"),
      relationshipType: RelationshipType.DERIVED_FROM,
      label: "from session",
    });
    expect(
      r.matches(
        asAssetId("mix"),
        asAssetId("rec"),
        RelationshipType.DERIVED_FROM,
      ),
    ).toBe(true);
    const snap = AssetRelationship.reconstitute(r.toSnapshot());
    expect(snap.label.value).toBe("from session");
  });
});
