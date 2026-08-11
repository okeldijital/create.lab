import type { AnyDomainEvent } from "@creative-lab/core";
import type {
  Organization,
  OrganizationId,
  OrganizationRepository,
  OrganizationSlug,
} from "@creative-lab/organization";
import type { ProductionId } from "@creative-lab/production";
import type { ProjectId } from "@creative-lab/projects";
import type { Asset } from "../../aggregates/Asset/Asset.js";
import type { AssetCollection } from "../../aggregates/AssetCollection/AssetCollection.js";
import type { AssetRelationship } from "../../aggregates/AssetRelationship/AssetRelationship.js";
import type { AssetVersion } from "../../aggregates/AssetVersion/AssetVersion.js";
import type { AssetType } from "../../enums/AssetType.js";
import { AssetVersionStatus } from "../../enums/AssetVersionStatus.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { AssetCollectionRepository } from "../../repositories/AssetCollectionRepository.js";
import type { AssetRelationshipRepository } from "../../repositories/AssetRelationshipRepository.js";
import type { AssetRepository } from "../../repositories/AssetRepository.js";
import type { AssetVersionRepository } from "../../repositories/AssetVersionRepository.js";
import type {
  AssetCollectionId,
  AssetId,
  AssetRelationshipId,
  AssetVersionId,
} from "../../types/ids.js";

export class InMemoryEventPublisher implements DomainEventPublisher {
  readonly events: AnyDomainEvent[] = [];
  async publish(events: readonly AnyDomainEvent[]): Promise<void> {
    this.events.push(...events);
  }
}

export class InMemoryOrganizationRepository implements OrganizationRepository {
  private readonly byId = new Map<string, Organization>();
  async findById(id: OrganizationId): Promise<Organization | null> {
    return this.byId.get(id) ?? null;
  }
  async findBySlug(
    slug: OrganizationSlug | string,
  ): Promise<Organization | null> {
    const v = typeof slug === "string" ? slug : slug.value;
    for (const o of this.byId.values()) {
      if (o.slug.value === v) return o;
    }
    return null;
  }
  async findAll(): Promise<Organization[]> {
    return [...this.byId.values()];
  }
  async save(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async update(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async archive(id: OrganizationId): Promise<void> {
    void id;
  }
  async exists(id: OrganizationId): Promise<boolean> {
    return this.byId.has(id);
  }
  async existsBySlug(slug: OrganizationSlug | string): Promise<boolean> {
    return (await this.findBySlug(slug)) !== null;
  }
  async delete(id: OrganizationId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryAssetRepository implements AssetRepository {
  private readonly byId = new Map<string, Asset>();

  async findById(id: AssetId): Promise<Asset | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Asset[]> {
    return [...this.byId.values()].filter(
      (a) => a.organizationId === organizationId,
    );
  }
  async findByProject(projectId: ProjectId): Promise<Asset[]> {
    return [...this.byId.values()].filter((a) => a.projectId === projectId);
  }
  async findByProduction(productionId: ProductionId): Promise<Asset[]> {
    return [...this.byId.values()].filter(
      (a) => a.productionId === productionId,
    );
  }
  async findByType(assetType: AssetType): Promise<Asset[]> {
    return [...this.byId.values()].filter((a) => a.assetType === assetType);
  }
  async save(a: Asset): Promise<void> {
    this.byId.set(a.id, a);
  }
  async update(a: Asset): Promise<void> {
    this.byId.set(a.id, a);
  }
  async archive(id: AssetId): Promise<void> {
    void id;
  }
  async exists(id: AssetId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryAssetVersionRepository
  implements AssetVersionRepository
{
  private readonly byId = new Map<string, AssetVersion>();

  async findById(id: AssetVersionId): Promise<AssetVersion | null> {
    return this.byId.get(id) ?? null;
  }
  async findByAsset(assetId: AssetId): Promise<AssetVersion[]> {
    return [...this.byId.values()].filter((v) => v.assetId === assetId);
  }
  async findCurrent(assetId: AssetId): Promise<AssetVersion | null> {
    return (
      [...this.byId.values()].find(
        (v) =>
          v.assetId === assetId &&
          v.status === AssetVersionStatus.CURRENT,
      ) ?? null
    );
  }
  async save(v: AssetVersion): Promise<void> {
    this.byId.set(v.id, v);
  }
  async update(v: AssetVersion): Promise<void> {
    this.byId.set(v.id, v);
  }
}

export class InMemoryAssetCollectionRepository
  implements AssetCollectionRepository
{
  private readonly byId = new Map<string, AssetCollection>();

  async findById(id: AssetCollectionId): Promise<AssetCollection | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<AssetCollection[]> {
    return [...this.byId.values()].filter(
      (c) => c.organizationId === organizationId,
    );
  }
  async save(c: AssetCollection): Promise<void> {
    this.byId.set(c.id, c);
  }
  async update(c: AssetCollection): Promise<void> {
    this.byId.set(c.id, c);
  }
  async archive(id: AssetCollectionId): Promise<void> {
    void id;
  }
}

export class InMemoryAssetRelationshipRepository
  implements AssetRelationshipRepository
{
  private readonly byId = new Map<string, AssetRelationship>();

  async findById(
    id: AssetRelationshipId,
  ): Promise<AssetRelationship | null> {
    return this.byId.get(id) ?? null;
  }
  async findBySource(sourceAssetId: AssetId): Promise<AssetRelationship[]> {
    return [...this.byId.values()].filter(
      (r) => r.sourceAssetId === sourceAssetId,
    );
  }
  async findByTarget(targetAssetId: AssetId): Promise<AssetRelationship[]> {
    return [...this.byId.values()].filter(
      (r) => r.targetAssetId === targetAssetId,
    );
  }
  async save(r: AssetRelationship): Promise<void> {
    this.byId.set(r.id, r);
  }
  async remove(id: AssetRelationshipId): Promise<void> {
    const r = this.byId.get(id);
    if (r && !r.removed) {
      // domain already marked removed; keep for history
      this.byId.set(id, r);
    }
  }
}
