import { describe, expect, it, beforeEach } from "vitest";
import { Organization, asOrganizationId } from "@creative-lab/organization";
import { asProductionId } from "@creative-lab/production";
import { asProjectId } from "@creative-lab/projects";
import { AssetStatus } from "../../enums/AssetStatus.js";
import { AssetType } from "../../enums/AssetType.js";
import { AssetVersionStatus } from "../../enums/AssetVersionStatus.js";
import { RelationshipType } from "../../enums/RelationshipType.js";
import {
  CircularRelationshipError,
  DuplicateCollectionError,
  DuplicateRelationshipError,
} from "../../errors/AssetErrors.js";
import {
  AssetArchived,
  AssetCreated,
  AssetRestored,
  AssetVersionCreated,
  AssetVersionPromoted,
  CollectionCreated,
  RelationshipCreated,
} from "../../events/asset-events.js";
import { AssetService } from "../../services/AssetService.js";
import { CollectionService } from "../../services/CollectionService.js";
import { RelationshipService } from "../../services/RelationshipService.js";
import { VersionService } from "../../services/VersionService.js";
import {
  InMemoryAssetCollectionRepository,
  InMemoryAssetRelationshipRepository,
  InMemoryAssetRepository,
  InMemoryAssetVersionRepository,
  InMemoryEventPublisher,
  InMemoryOrganizationRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const productionId = asProductionId("prod-1");

describe("Asset services", () => {
  let orgs: InMemoryOrganizationRepository;
  let assets: InMemoryAssetRepository;
  let versions: InMemoryAssetVersionRepository;
  let collections: InMemoryAssetCollectionRepository;
  let relationships: InMemoryAssetRelationshipRepository;
  let events: InMemoryEventPublisher;
  let assetService: AssetService;
  let versionService: VersionService;
  let collectionService: CollectionService;
  let relationshipService: RelationshipService;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    assets = new InMemoryAssetRepository();
    versions = new InMemoryAssetVersionRepository();
    collections = new InMemoryAssetCollectionRepository();
    relationships = new InMemoryAssetRelationshipRepository();
    events = new InMemoryEventPublisher();
    await orgs.save(
      Organization.create({ name: "Studio", slug: "studio", id: orgId }),
    );
    assetService = new AssetService({
      assetRepository: assets,
      assetVersionRepository: versions,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    versionService = new VersionService({
      assetVersionRepository: versions,
      eventPublisher: events,
    });
    collectionService = new CollectionService({
      assetCollectionRepository: collections,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    relationshipService = new RelationshipService({
      assetRelationshipRepository: relationships,
      eventPublisher: events,
    });
  });

  it("creates asset with v1 current", async () => {
    const { asset, version } = await assetService.create({
      organizationId: orgId,
      projectId,
      productionId,
      name: "Song Master",
      assetType: AssetType.MASTER,
      createdBy: "eng",
      checksum: "sha256abc",
      metadata: { format: "wav" },
    });
    expect(asset.status).toBe(AssetStatus.ACTIVE);
    expect(version.versionNumber.value).toBe(1);
    expect(version.isCurrent).toBe(true);
    expect(asset.currentVersionId).toBe(version.id);
    expect(events.events.some((e) => e instanceof AssetCreated)).toBe(true);
    expect(events.events.some((e) => e instanceof AssetVersionCreated)).toBe(
      true,
    );
  });

  it("creates sequential versions and promotes", async () => {
    const { asset } = await assetService.create({
      organizationId: orgId,
      name: "Mix",
      assetType: AssetType.MIX,
      createdBy: "u",
      checksum: "h1",
    });
    const { version: v2, asset: a2 } = await assetService.createVersion({
      assetId: asset.id,
      checksum: "h2",
      createdBy: "u",
      promote: true,
    });
    expect(v2.versionNumber.value).toBe(2);
    expect(a2.currentVersionId).toBe(v2.id);
    expect(events.events.some((e) => e instanceof AssetVersionPromoted)).toBe(
      true,
    );
    const current = await versionService.findCurrent(asset.id);
    expect(current?.id).toBe(v2.id);
    expect(current?.status).toBe(AssetVersionStatus.CURRENT);

    const all = await versionService.listByAsset(asset.id);
    expect(all).toHaveLength(2);
    expect(all.filter((v) => v.isCurrent)).toHaveLength(1);
  });

  it("archives and restores assets", async () => {
    const { asset } = await assetService.create({
      organizationId: orgId,
      name: "Photo",
      assetType: AssetType.IMAGE,
      createdBy: "u",
      checksum: "imghash",
    });
    await assetService.archive(asset.id);
    expect(events.events.some((e) => e instanceof AssetArchived)).toBe(true);
    await assetService.restore(asset.id);
    expect(events.events.some((e) => e instanceof AssetRestored)).toBe(true);
    expect((await assetService.getById(asset.id)).status).toBe(
      AssetStatus.ACTIVE,
    );
  });

  it("renames asset", async () => {
    const { asset } = await assetService.create({
      organizationId: orgId,
      name: "Old",
      assetType: AssetType.DOCUMENT,
      createdBy: "u",
      checksum: "d1",
    });
    const renamed = await assetService.rename(asset.id, "New Name");
    expect(renamed.name.value).toBe("New Name");
  });

  it("manages collections", async () => {
    const c = await collectionService.create({
      organizationId: orgId,
      name: "Artwork Pack",
    });
    expect(events.events.some((e) => e instanceof CollectionCreated)).toBe(
      true,
    );
    const { asset } = await assetService.create({
      organizationId: orgId,
      name: "Cover",
      assetType: AssetType.ARTWORK,
      createdBy: "u",
      checksum: "c1",
    });
    await collectionService.addAsset(c.id, asset.id);
    expect((await collectionService.getById(c.id)).contains(asset.id)).toBe(
      true,
    );
    await collectionService.removeAsset(c.id, asset.id);
    await collectionService.rename(c.id, "Marketing Assets");
    await expect(
      collectionService.create({
        organizationId: orgId,
        name: "marketing assets",
      }),
    ).rejects.toThrow(DuplicateCollectionError);
    await collectionService.archive(c.id);
  });

  it("creates relationships and rejects self/dupes", async () => {
    const a = await assetService.create({
      organizationId: orgId,
      name: "Recording",
      assetType: AssetType.AUDIO,
      createdBy: "u",
      checksum: "r1",
    });
    const b = await assetService.create({
      organizationId: orgId,
      name: "Mix",
      assetType: AssetType.MIX,
      createdBy: "u",
      checksum: "m1",
    });
    const rel = await relationshipService.create({
      organizationId: orgId,
      sourceAssetId: b.asset.id,
      targetAssetId: a.asset.id,
      relationshipType: RelationshipType.DERIVED_FROM,
    });
    expect(events.events.some((e) => e instanceof RelationshipCreated)).toBe(
      true,
    );
    await expect(
      relationshipService.create({
        organizationId: orgId,
        sourceAssetId: b.asset.id,
        targetAssetId: a.asset.id,
        relationshipType: RelationshipType.DERIVED_FROM,
      }),
    ).rejects.toThrow(DuplicateRelationshipError);
    await expect(
      relationshipService.create({
        organizationId: orgId,
        sourceAssetId: a.asset.id,
        targetAssetId: a.asset.id,
        relationshipType: RelationshipType.RELATED_TO,
      }),
    ).rejects.toThrow(CircularRelationshipError);
    await relationshipService.remove(rel.id);
  });

  it("lists by project, production, type", async () => {
    await assetService.create({
      organizationId: orgId,
      projectId,
      productionId,
      name: "Stem",
      assetType: AssetType.STEM,
      createdBy: "u",
      checksum: "s1",
    });
    expect((await assetService.listByProject(projectId)).length).toBe(1);
    expect((await assetService.listByProduction(productionId)).length).toBe(1);
    expect((await assetService.listByType(AssetType.STEM)).length).toBe(1);
  });

  it("promotes an older version back to current", async () => {
    const { asset, version: v1 } = await assetService.create({
      organizationId: orgId,
      name: "Video",
      assetType: AssetType.VIDEO,
      createdBy: "u",
      checksum: "v1",
    });
    const { version: v2 } = await assetService.createVersion({
      assetId: asset.id,
      checksum: "v2",
      createdBy: "u",
    });
    expect(v2.versionNumber.value).toBe(2);
    await assetService.promoteCurrentVersion(asset.id, v1.id);
    const current = await versionService.findCurrent(asset.id);
    expect(current?.id).toBe(v1.id);
  });

  it("createVersion without promote leaves prior current", async () => {
    const { asset, version: v1 } = await assetService.create({
      organizationId: orgId,
      name: "Session",
      assetType: AssetType.SESSION,
      createdBy: "u",
      checksum: "s1",
    });
    const { version: v2 } = await assetService.createVersion({
      assetId: asset.id,
      checksum: "s2",
      createdBy: "u",
      promote: false,
    });
    expect(v2.status).toBe(AssetVersionStatus.SUPERSEDED);
    const still = await assetService.getById(asset.id);
    expect(still.currentVersionId).toBe(v1.id);
  });

  it("version service validates sequential numbers", async () => {
    const { asset } = await assetService.create({
      organizationId: orgId,
      name: "Project File",
      assetType: AssetType.PROJECT,
      createdBy: "u",
      checksum: "p1",
    });
    await expect(
      versionService.validateSequential(asset.id, 1),
    ).rejects.toThrow();
    await expect(
      versionService.validateSequential(asset.id, 2),
    ).resolves.toBeUndefined();
  });

  it("lists collections by organization", async () => {
    await collectionService.create({
      organizationId: orgId,
      name: "Mix Stems",
    });
    expect(
      (await collectionService.listByOrganization(orgId)).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("lists relationships by source and target", async () => {
    const a = await assetService.create({
      organizationId: orgId,
      name: "Source",
      assetType: AssetType.AUDIO,
      createdBy: "u",
      checksum: "src",
    });
    const b = await assetService.create({
      organizationId: orgId,
      name: "Target",
      assetType: AssetType.MASTER,
      createdBy: "u",
      checksum: "tgt",
    });
    await relationshipService.create({
      organizationId: orgId,
      sourceAssetId: a.asset.id,
      targetAssetId: b.asset.id,
      relationshipType: RelationshipType.GENERATED_FROM,
    });
    expect(
      (await relationshipService.listBySource(a.asset.id)).length,
    ).toBe(1);
    expect(
      (await relationshipService.listByTarget(b.asset.id)).length,
    ).toBe(1);
  });
});
