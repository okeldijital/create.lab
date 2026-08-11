import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import {
  KnowledgeArticle,
  type CreateKnowledgeArticleProps,
} from "../aggregates/KnowledgeArticle/KnowledgeArticle.js";
import { KnowledgeStatus } from "../enums/KnowledgeStatus.js";
import {
  DuplicateArticleNumberError,
  KnowledgeArticleNotFoundError,
  KnowledgeCategoryNotFoundError,
} from "../errors/KnowledgeErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { KnowledgeLifecyclePolicy } from "../policies/KnowledgeLifecyclePolicy.js";
import type { KnowledgeArticleRepository } from "../repositories/KnowledgeArticleRepository.js";
import type { KnowledgeCategoryRepository } from "../repositories/KnowledgeCategoryRepository.js";
import type {
  KnowledgeArticleId,
  KnowledgeCategoryId,
} from "../types/ids.js";

export type KnowledgeArticleServiceDeps = {
  articleRepository: KnowledgeArticleRepository;
  categoryRepository: KnowledgeCategoryRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class KnowledgeArticleService {
  constructor(private readonly deps: KnowledgeArticleServiceDeps) {}

  async create(props: CreateKnowledgeArticleProps): Promise<KnowledgeArticle> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const category = await this.deps.categoryRepository.findById(
      props.categoryId,
    );
    if (!category || category.isArchived) {
      throw new KnowledgeCategoryNotFoundError(props.categoryId);
    }
    if (category.organizationId !== props.organizationId) {
      throw new KnowledgeCategoryNotFoundError(props.categoryId);
    }
    const article = KnowledgeArticle.create(props);
    const existing = await this.deps.articleRepository.findByArticleNumber(
      props.organizationId,
      article.articleNumber.value,
    );
    if (existing) {
      throw new DuplicateArticleNumberError(
        article.articleNumber.value,
        props.organizationId,
      );
    }
    await this.deps.articleRepository.save(article);
    await this.deps.eventPublisher.publish(article.pullDomainEvents());
    return article;
  }

  async submitForReview(
    id: KnowledgeArticleId,
    now?: Date,
  ): Promise<KnowledgeArticle> {
    const article = await this.getById(id);
    KnowledgeLifecyclePolicy.assertCanTransition(
      article,
      KnowledgeStatus.REVIEW,
    );
    article.submitForReview(now);
    await this.deps.articleRepository.update(article);
    await this.deps.eventPublisher.publish(article.pullDomainEvents());
    return article;
  }

  async approve(
    id: KnowledgeArticleId,
    now?: Date,
  ): Promise<KnowledgeArticle> {
    const article = await this.getById(id);
    KnowledgeLifecyclePolicy.assertCanTransition(
      article,
      KnowledgeStatus.APPROVED,
    );
    article.approve(now);
    await this.deps.articleRepository.update(article);
    await this.deps.eventPublisher.publish(article.pullDomainEvents());
    return article;
  }

  async activate(
    id: KnowledgeArticleId,
    now?: Date,
  ): Promise<KnowledgeArticle> {
    const article = await this.getById(id);
    KnowledgeLifecyclePolicy.assertCanActivate(article);
    article.activate(now);
    await this.deps.articleRepository.update(article);
    await this.deps.eventPublisher.publish(article.pullDomainEvents());
    return article;
  }

  async retire(
    id: KnowledgeArticleId,
    now?: Date,
  ): Promise<KnowledgeArticle> {
    const article = await this.getById(id);
    KnowledgeLifecyclePolicy.assertCanTransition(
      article,
      KnowledgeStatus.RETIRED,
    );
    article.retire(now);
    await this.deps.articleRepository.update(article);
    await this.deps.eventPublisher.publish(article.pullDomainEvents());
    return article;
  }

  async archive(
    id: KnowledgeArticleId,
    now?: Date,
  ): Promise<KnowledgeArticle> {
    const article = await this.getById(id);
    KnowledgeLifecyclePolicy.assertCanArchive(article);
    article.archive(now);
    await this.deps.articleRepository.archive(id);
    await this.deps.articleRepository.update(article);
    await this.deps.eventPublisher.publish(article.pullDomainEvents());
    return article;
  }

  async getById(id: KnowledgeArticleId): Promise<KnowledgeArticle> {
    const article = await this.deps.articleRepository.findById(id);
    if (!article) throw new KnowledgeArticleNotFoundError(id);
    return article;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<KnowledgeArticle[]> {
    return this.deps.articleRepository.findByOrganization(organizationId);
  }

  async listByCategory(
    categoryId: KnowledgeCategoryId,
  ): Promise<KnowledgeArticle[]> {
    return this.deps.articleRepository.findByCategory(categoryId);
  }

  async listByStatus(status: KnowledgeStatus): Promise<KnowledgeArticle[]> {
    return this.deps.articleRepository.findByStatus(status);
  }
}
