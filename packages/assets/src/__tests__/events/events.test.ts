import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { asOrganizationId } from "@creative-lab/organization";
import { AssetStatus } from "../../enums/AssetStatus.js";
import { AssetType } from "../../enums/AssetType.js";
import { AssetVersionStatus } from "../../enums/AssetVersionStatus.js";
import { RelationshipType } from "../../enums/RelationshipType.js";
import {
  AssetAddedToCollection,
  AssetArchived,
  AssetCreated,
  AssetRemovedFromCollection,
  AssetRestored,
  AssetUpdated,
  AssetVersionCreated,
  AssetVersionPromoted,
  CollectionArchived,
  CollectionCreated,
  RelationshipCreated,
  RelationshipRemoved,
} from "../../events/asset-events.js";
import {
  asAssetCollectionId,
  asAssetId,
  asAssetRelationshipId,
  asAssetVersionId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");

describe("Domain events", () => {
  it("are frozen and versioned", () => {
    const e = AssetCreated.create({
      organizationId: orgId,
      assetId: asAssetId("a1"),
      name: "Master",
      assetType: AssetType.MASTER,
      currentVersionId: asAssetVersionId("v1"),
      status: AssetStatus.ACTIVE,
    });
    expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(Object.isFrozen(e)).toBe(true);
    expect(Object.isFrozen(e.payload)).toBe(true);
  });

  it("covers minimum event set", () => {
    const events = [
      AssetUpdated.create({
        organizationId: orgId,
        assetId: asAssetId("a1"),
      }),
      AssetArchived.create({
        organizationId: orgId,
        assetId: asAssetId("a1"),
      }),
      AssetRestored.create({
        organizationId: orgId,
        assetId: asAssetId("a1"),
      }),
      AssetVersionCreated.create({
        organizationId: orgId,
        versionId: asAssetVersionId("v1"),
        assetId: asAssetId("a1"),
        versionNumber: 1,
        status: AssetVersionStatus.CURRENT,
      }),
      AssetVersionPromoted.create({
        organizationId: orgId,
        versionId: asAssetVersionId("v2"),
        assetId: asAssetId("a1"),
        previousVersionId: asAssetVersionId("v1"),
      }),
      CollectionCreated.create({
        organizationId: orgId,
        collectionId: asAssetCollectionId("c1"),
        name: "Pack",
      }),
      CollectionArchived.create({
        organizationId: orgId,
        collectionId: asAssetCollectionId("c1"),
      }),
      AssetAddedToCollection.create({
        organizationId: orgId,
        collectionId: asAssetCollectionId("c1"),
        assetId: asAssetId("a1"),
      }),
      AssetRemovedFromCollection.create({
        organizationId: orgId,
        collectionId: asAssetCollectionId("c1"),
        assetId: asAssetId("a1"),
      }),
      RelationshipCreated.create({
        organizationId: orgId,
        relationshipId: asAssetRelationshipId("r1"),
        sourceAssetId: asAssetId("a1"),
        targetAssetId: asAssetId("a2"),
        relationshipType: RelationshipType.DERIVED_FROM,
      }),
      RelationshipRemoved.create({
        organizationId: orgId,
        relationshipId: asAssetRelationshipId("r1"),
      }),
    ];
    for (const e of events) {
      expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
      expect(Object.isFrozen(e)).toBe(true);
    }
  });
});
