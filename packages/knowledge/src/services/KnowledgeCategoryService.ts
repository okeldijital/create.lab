import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import {
  KnowledgeCategory,
  type CreateKnowledgeCategoryProps,
} from "../aggregates/KnowledgeCategory/KnowledgeCategory.js";
import {
  KnowledgeCategoryNotFoundError,
} from "../errors/KnowledgeErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { CategoryPolicy } from "../policies/CategoryPolicy.js";
import type { KnowledgeArticleRepository } from "../repositories/KnowledgeArticleRepository.js";
import type { KnowledgeCategoryRepository } from "../repositories/KnowledgeCategoryRepository.js";
import type { KnowledgeCategoryId } from "../types/ids.js";
import { CategoryName } from "../value-objects/CategoryName.js";

export type KnowledgeCategoryServiceDeps = {
  categoryRepository: KnowledgeCategoryRepository;
  articleRepository: KnowledgeArticleRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class KnowledgeCategoryService {
  constructor(private readonly deps: KnowledgeCategoryServiceDeps) {}

  async create(
    props: CreateKnowledgeCategoryProps,
  ): Promise<KnowledgeCategory> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const name = CategoryName.create(props.name).value;
    const existing = await this.deps.categoryRepository.findByName(
      props.organizationId,
      name,
    );
    CategoryPolicy.assertUniqueName(name, props.organizationId, existing);

    const category = KnowledgeCategory.create({ ...props, name });
    await this.deps.categoryRepository.save(category);
    await this.deps.eventPublisher.publish(category.pullDomainEvents());
    return category;
  }

  async rename(
    id: KnowledgeCategoryId,
    name: string,
    now?: Date,
  ): Promise<KnowledgeCategory> {
    const category = await this.getById(id);
    CategoryPolicy.assertMutable(category);
    const normalized = CategoryName.create(name).value;
    if (normalized !== category.name.value) {
      const existing = await this.deps.categoryRepository.findByName(
        category.organizationId,
        normalized,
      );
      CategoryPolicy.assertUniqueName(
        normalized,
        category.organizationId,
        existing,
      );
    }
    category.rename(normalized, now);
    await this.deps.categoryRepository.update(category);
    await this.deps.eventPublisher.publish(category.pullDomainEvents());
    return category;
  }

  async archive(
    id: KnowledgeCategoryId,
    now?: Date,
  ): Promise<KnowledgeCategory> {
    const category = await this.getById(id);
    const articles = await this.deps.articleRepository.findByCategory(id);
    CategoryPolicy.assertCanArchive(category, articles);
    category.archive(now);
    await this.deps.categoryRepository.archive(id);
    await this.deps.categoryRepository.update(category);
    await this.deps.eventPublisher.publish(category.pullDomainEvents());
    return category;
  }

  async getById(id: KnowledgeCategoryId): Promise<KnowledgeCategory> {
    const category = await this.deps.categoryRepository.findById(id);
    if (!category) throw new KnowledgeCategoryNotFoundError(id);
    return category;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<KnowledgeCategory[]> {
    return this.deps.categoryRepository.findByOrganization(organizationId);
  }
}
