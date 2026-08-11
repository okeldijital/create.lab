import { generateId } from "@creative-lab/core";
import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import type { ProductionId } from "@creative-lab/production";
import type { ProjectId } from "@creative-lab/projects";
import { Asset } from "../aggregates/Asset/Asset.js";
import { AssetVersion } from "../aggregates/AssetVersion/AssetVersion.js";
import type { AssetType } from "../enums/AssetType.js";
import { AssetVersionStatus } from "../enums/AssetVersionStatus.js";
import {
  AssetNotFoundError,
  AssetVersionNotFoundError,
} from "../errors/AssetErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import {
  AssetLifecyclePolicy,
  VersionPolicy,
} from "../policies/index.js";
import type { AssetRepository } from "../repositories/AssetRepository.js";
import type { AssetVersionRepository } from "../repositories/AssetVersionRepository.js";
import {
  asAssetId,
  asAssetVersionId,
  type AssetId,
  type AssetVersionId,
} from "../types/ids.js";

export type AssetServiceDeps = {
  assetRepository: AssetRepository;
  assetVersionRepository: AssetVersionRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export type CreateAssetWithVersionProps = {
  organizationId: OrganizationId;
  projectId?: ProjectId | null;
  productionId?: ProductionId | null;
  name: string;
  description?: string | null;
  assetType: AssetType;
  createdBy: string;
  checksum: string;
  metadata?: Record<string, string | number | boolean | null> | null;
  id?: string;
  versionId?: string;
  now?: Date;
};

export type CreateVersionProps = {
  assetId: AssetId;
  checksum: string;
  metadata?: Record<string, string | number | boolean | null> | null;
  createdBy: string;
  /** If true (default), promote as current and supersede previous. */
  promote?: boolean;
  now?: Date;
};

export class AssetService {
  constructor(private readonly deps: AssetServiceDeps) {}

  async create(
    props: CreateAssetWithVersionProps,
  ): Promise<{ asset: Asset; version: AssetVersion }> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }

    const now = props.now ?? new Date();
    // Pre-generate ids so asset and version reference each other
    const assetId = asAssetId(props.id ?? generateId());
    const versionId = asAssetVersionId(props.versionId ?? generateId());

    const version = AssetVersion.create({
      organizationId: props.organizationId,
      assetId,
      versionNumber: 1,
      checksum: props.checksum,
      metadata: props.metadata,
      createdBy: props.createdBy,
      status: AssetVersionStatus.CURRENT,
      id: versionId,
      now,
    });

    const asset = Asset.create({
      organizationId: props.organizationId,
      projectId: props.projectId,
      productionId: props.productionId,
      name: props.name,
      description: props.description,
      assetType: props.assetType,
      currentVersionId: version.id,
      createdBy: props.createdBy,
      id: assetId,
      now,
    });

    await this.deps.assetVersionRepository.save(version);
    await this.deps.assetRepository.save(asset);
    await this.deps.eventPublisher.publish([
      ...asset.pullDomainEvents(),
      ...version.pullDomainEvents(),
    ]);
    return { asset, version };
  }

  async rename(
    id: AssetId,
    name: string,
    now?: Date,
  ): Promise<Asset> {
    const asset = await this.getById(id);
    AssetLifecyclePolicy.assertMutable(asset);
    asset.rename(name, now);
    await this.deps.assetRepository.update(asset);
    await this.deps.eventPublisher.publish(asset.pullDomainEvents());
    return asset;
  }

  async archive(id: AssetId, now?: Date): Promise<Asset> {
    const asset = await this.getById(id);
    asset.archive(now);
    await this.deps.assetRepository.archive(id);
    await this.deps.assetRepository.update(asset);
    await this.deps.eventPublisher.publish(asset.pullDomainEvents());
    return asset;
  }

  async restore(id: AssetId, now?: Date): Promise<Asset> {
    const asset = await this.getById(id);
    AssetLifecyclePolicy.assertCanRestore(asset);
    asset.restore(now);
    await this.deps.assetRepository.update(asset);
    await this.deps.eventPublisher.publish(asset.pullDomainEvents());
    return asset;
  }

  async createVersion(props: CreateVersionProps): Promise<{
    asset: Asset;
    version: AssetVersion;
  }> {
    const asset = await this.getById(props.assetId);
    AssetLifecyclePolicy.assertMutable(asset);

    const existing = await this.deps.assetVersionRepository.findByAsset(
      props.assetId,
    );
    const versionNumber = VersionPolicy.nextNumber(existing).value;
    VersionPolicy.assertSequential(existing, versionNumber);

    const promote = props.promote !== false;
    const now = props.now ?? new Date();

    const version = AssetVersion.create({
      organizationId: asset.organizationId,
      assetId: asset.id,
      versionNumber,
      checksum: props.checksum,
      metadata: props.metadata,
      createdBy: props.createdBy,
      status: promote
        ? AssetVersionStatus.CURRENT
        : AssetVersionStatus.SUPERSEDED,
      now,
    });

    if (promote) {
      const previousId = asset.currentVersionId;
      const previous = existing.find((v) => v.id === previousId);
      if (previous) {
        previous.markSuperseded();
        await this.deps.assetVersionRepository.update(previous);
      }
      asset.promoteVersion(version.id, previousId ?? null, now);
    }

    await this.deps.assetVersionRepository.save(version);
    await this.deps.assetRepository.update(asset);
    await this.deps.eventPublisher.publish([
      ...version.pullDomainEvents(),
      ...asset.pullDomainEvents(),
    ]);
    return { asset, version };
  }

  async promoteCurrentVersion(
    assetId: AssetId,
    versionId: AssetVersionId,
    now?: Date,
  ): Promise<Asset> {
    const asset = await this.getById(assetId);
    AssetLifecyclePolicy.assertMutable(asset);

    const version = await this.deps.assetVersionRepository.findById(versionId);
    if (!version) throw new AssetVersionNotFoundError(versionId);
    VersionPolicy.assertBelongsToAsset(version, assetId);

    const existing = await this.deps.assetVersionRepository.findByAsset(assetId);
    const previousId = asset.currentVersionId;
    for (const v of existing) {
      if (v.id === versionId) {
        v.markCurrent();
        await this.deps.assetVersionRepository.update(v);
      } else if (v.isCurrent) {
        v.markSuperseded();
        await this.deps.assetVersionRepository.update(v);
      }
    }

    asset.promoteVersion(versionId, previousId, now);
    await this.deps.assetRepository.update(asset);
    await this.deps.eventPublisher.publish(asset.pullDomainEvents());
    return asset;
  }

  async getById(id: AssetId): Promise<Asset> {
    const asset = await this.deps.assetRepository.findById(id);
    if (!asset) throw new AssetNotFoundError(id);
    return asset;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Asset[]> {
    return this.deps.assetRepository.findByOrganization(organizationId);
  }

  async listByProject(projectId: ProjectId): Promise<Asset[]> {
    return this.deps.assetRepository.findByProject(projectId);
  }

  async listByProduction(productionId: ProductionId): Promise<Asset[]> {
    return this.deps.assetRepository.findByProduction(productionId);
  }

  async listByType(assetType: AssetType): Promise<Asset[]> {
    return this.deps.assetRepository.findByType(assetType);
  }
}
