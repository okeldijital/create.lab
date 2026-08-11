import type { AnyDomainEvent } from "@creative-lab/core";
import type {
  Organization,
  OrganizationId,
  OrganizationRepository,
  OrganizationSlug,
} from "@creative-lab/organization";
import type { KnowledgeArticle } from "../../aggregates/KnowledgeArticle/KnowledgeArticle.js";
import type { KnowledgeCategory } from "../../aggregates/KnowledgeCategory/KnowledgeCategory.js";
import type { KnowledgeReference } from "../../aggregates/KnowledgeReference/KnowledgeReference.js";
import type { KnowledgeVersion } from "../../aggregates/KnowledgeVersion/KnowledgeVersion.js";
import type { CategoryStatus } from "../../enums/CategoryStatus.js";
import type { KnowledgeStatus } from "../../enums/KnowledgeStatus.js";
import type { RelationshipType } from "../../enums/RelationshipType.js";
import type { VersionStatus } from "../../enums/VersionStatus.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { KnowledgeArticleRepository } from "../../repositories/KnowledgeArticleRepository.js";
import type { KnowledgeCategoryRepository } from "../../repositories/KnowledgeCategoryRepository.js";
import type { KnowledgeReferenceRepository } from "../../repositories/KnowledgeReferenceRepository.js";
import type { KnowledgeVersionRepository } from "../../repositories/KnowledgeVersionRepository.js";
import type {
  KnowledgeArticleId,
  KnowledgeCategoryId,
  KnowledgeReferenceId,
  KnowledgeVersionId,
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

export class InMemoryKnowledgeArticleRepository
  implements KnowledgeArticleRepository
{
  private readonly byId = new Map<string, KnowledgeArticle>();
  async findById(id: KnowledgeArticleId): Promise<KnowledgeArticle | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<KnowledgeArticle[]> {
    return [...this.byId.values()].filter(
      (a) => a.organizationId === organizationId,
    );
  }
  async findByCategory(
    categoryId: KnowledgeCategoryId,
  ): Promise<KnowledgeArticle[]> {
    return [...this.byId.values()].filter((a) => a.categoryId === categoryId);
  }
  async findByStatus(status: KnowledgeStatus): Promise<KnowledgeArticle[]> {
    return [...this.byId.values()].filter((a) => a.status === status);
  }
  async findByArticleNumber(
    organizationId: OrganizationId,
    articleNumber: string,
  ): Promise<KnowledgeArticle | null> {
    return (
      [...this.byId.values()].find(
        (a) =>
          a.organizationId === organizationId &&
          a.articleNumber.value === articleNumber,
      ) ?? null
    );
  }
  async save(article: KnowledgeArticle): Promise<void> {
    this.byId.set(article.id, article);
  }
  async update(article: KnowledgeArticle): Promise<void> {
    this.byId.set(article.id, article);
  }
  async archive(id: KnowledgeArticleId): Promise<void> {
    void id;
  }
  async exists(id: KnowledgeArticleId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryKnowledgeVersionRepository
  implements KnowledgeVersionRepository
{
  private readonly byId = new Map<string, KnowledgeVersion>();
  async findById(id: KnowledgeVersionId): Promise<KnowledgeVersion | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<KnowledgeVersion[]> {
    return [...this.byId.values()].filter(
      (v) => v.organizationId === organizationId,
    );
  }
  async findByArticle(
    articleId: KnowledgeArticleId,
  ): Promise<KnowledgeVersion[]> {
    return [...this.byId.values()].filter((v) => v.articleId === articleId);
  }
  async findByStatus(status: VersionStatus): Promise<KnowledgeVersion[]> {
    return [...this.byId.values()].filter((v) => v.status === status);
  }
  async findCurrentVersion(
    articleId: KnowledgeArticleId,
  ): Promise<KnowledgeVersion | null> {
    return (
      [...this.byId.values()].find(
        (v) => v.articleId === articleId && v.isCurrent,
      ) ?? null
    );
  }
  async save(version: KnowledgeVersion): Promise<void> {
    this.byId.set(version.id, version);
  }
  async update(version: KnowledgeVersion): Promise<void> {
    this.byId.set(version.id, version);
  }
  async archive(id: KnowledgeVersionId): Promise<void> {
    void id;
  }
  async exists(id: KnowledgeVersionId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryKnowledgeCategoryRepository
  implements KnowledgeCategoryRepository
{
  private readonly byId = new Map<string, KnowledgeCategory>();
  async findById(id: KnowledgeCategoryId): Promise<KnowledgeCategory | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<KnowledgeCategory[]> {
    return [...this.byId.values()].filter(
      (c) => c.organizationId === organizationId,
    );
  }
  async findByStatus(status: CategoryStatus): Promise<KnowledgeCategory[]> {
    return [...this.byId.values()].filter((c) => c.status === status);
  }
  async findByName(
    organizationId: OrganizationId,
    name: string,
  ): Promise<KnowledgeCategory | null> {
    return (
      [...this.byId.values()].find(
        (c) =>
          c.organizationId === organizationId &&
          c.name.value.toLowerCase() === name.toLowerCase(),
      ) ?? null
    );
  }
  async save(category: KnowledgeCategory): Promise<void> {
    this.byId.set(category.id, category);
  }
  async update(category: KnowledgeCategory): Promise<void> {
    this.byId.set(category.id, category);
  }
  async archive(id: KnowledgeCategoryId): Promise<void> {
    void id;
  }
  async exists(id: KnowledgeCategoryId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryKnowledgeReferenceRepository
  implements KnowledgeReferenceRepository
{
  private readonly byId = new Map<string, KnowledgeReference>();
  async findById(
    id: KnowledgeReferenceId,
  ): Promise<KnowledgeReference | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<KnowledgeReference[]> {
    return [...this.byId.values()].filter(
      (r) => r.organizationId === organizationId,
    );
  }
  async findBySource(
    sourceArticleId: KnowledgeArticleId,
  ): Promise<KnowledgeReference[]> {
    return [...this.byId.values()].filter(
      (r) => r.sourceArticleId === sourceArticleId,
    );
  }
  async findByTarget(
    targetArticleId: KnowledgeArticleId,
  ): Promise<KnowledgeReference[]> {
    return [...this.byId.values()].filter(
      (r) => r.targetArticleId === targetArticleId,
    );
  }
  async findByRelationship(
    sourceArticleId: KnowledgeArticleId,
    targetArticleId: KnowledgeArticleId,
    relationshipType: RelationshipType,
  ): Promise<KnowledgeReference | null> {
    return (
      [...this.byId.values()].find(
        (r) =>
          r.sourceArticleId === sourceArticleId &&
          r.targetArticleId === targetArticleId &&
          r.relationshipType === relationshipType &&
          r.isActive,
      ) ?? null
    );
  }
  async save(reference: KnowledgeReference): Promise<void> {
    this.byId.set(reference.id, reference);
  }
  async update(reference: KnowledgeReference): Promise<void> {
    this.byId.set(reference.id, reference);
  }
  async archive(id: KnowledgeReferenceId): Promise<void> {
    void id;
  }
  async exists(id: KnowledgeReferenceId): Promise<boolean> {
    return this.byId.has(id);
  }
}
