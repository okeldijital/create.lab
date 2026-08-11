import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { asProductionId } from "@creative-lab/production";
import { asProjectId } from "@creative-lab/projects";
import { Asset } from "../../aggregates/Asset/Asset.js";
import { AssetCollection } from "../../aggregates/AssetCollection/AssetCollection.js";
import { AssetRelationship } from "../../aggregates/AssetRelationship/AssetRelationship.js";
import { AssetVersion } from "../../aggregates/AssetVersion/AssetVersion.js";
import { AssetType } from "../../enums/AssetType.js";
import { RelationshipType } from "../../enums/RelationshipType.js";
import {
  InMemoryAssetCollectionRepository,
  InMemoryAssetRelationshipRepository,
  InMemoryAssetRepository,
  InMemoryAssetVersionRepository,
} from "../helpers/in-memory.js";
import { asAssetId, asAssetVersionId } from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const productionId = asProductionId("prod-1");

describe("Repository contracts", () => {
  it("AssetRepository ports", async () => {
    const repo = new InMemoryAssetRepository();
    const asset = Asset.create({
      organizationId: orgId,
      projectId,
      productionId,
      name: "A",
      assetType: AssetType.AUDIO,
      currentVersionId: asAssetVersionId("v1"),
      createdBy: "u",
    });
    await repo.save(asset);
    expect(await repo.exists(asset.id)).toBe(true);
    expect((await repo.findByProject(projectId))[0]?.id).toBe(asset.id);
    expect((await repo.findByProduction(productionId))[0]?.id).toBe(asset.id);
    expect((await repo.findByType(AssetType.AUDIO)).length).toBe(1);
  });

  it("AssetVersionRepository ports", async () => {
    const repo = new InMemoryAssetVersionRepository();
    const assetId = asAssetId("a1");
    const v = AssetVersion.create({
      organizationId: orgId,
      assetId,
      versionNumber: 1,
      checksum: "h",
      createdBy: "u",
    });
    await repo.save(v);
    expect((await repo.findByAsset(assetId)).length).toBe(1);
    expect((await repo.findCurrent(assetId))?.id).toBe(v.id);
  });

  it("Collection and Relationship repository ports", async () => {
    const cRepo = new InMemoryAssetCollectionRepository();
    const c = AssetCollection.create({
      organizationId: orgId,
      name: "Pack",
    });
    await cRepo.save(c);
    expect((await cRepo.findByOrganization(orgId)).length).toBe(1);

    const rRepo = new InMemoryAssetRelationshipRepository();
    const r = AssetRelationship.create({
      organizationId: orgId,
      sourceAssetId: asAssetId("s"),
      targetAssetId: asAssetId("t"),
      relationshipType: RelationshipType.REFERENCES,
    });
    await rRepo.save(r);
    expect((await rRepo.findBySource(asAssetId("s"))).length).toBe(1);
    expect((await rRepo.findByTarget(asAssetId("t"))).length).toBe(1);
  });
});
