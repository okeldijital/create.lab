import {
  KnowledgeVersion,
  type CreateKnowledgeVersionProps,
} from "../aggregates/KnowledgeVersion/KnowledgeVersion.js";
import { VersionStatus } from "../enums/VersionStatus.js";
import {
  InvalidKnowledgeStateError,
  KnowledgeArticleNotFoundError,
  KnowledgeVersionNotFoundError,
} from "../errors/KnowledgeErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { KnowledgeLifecyclePolicy } from "../policies/KnowledgeLifecyclePolicy.js";
import { VersionPolicy } from "../policies/VersionPolicy.js";
import type { KnowledgeArticleRepository } from "../repositories/KnowledgeArticleRepository.js";
import type { KnowledgeVersionRepository } from "../repositories/KnowledgeVersionRepository.js";
import type {
  KnowledgeArticleId,
  KnowledgeVersionId,
} from "../types/ids.js";

export type KnowledgeVersionServiceDeps = {
  versionRepository: KnowledgeVersionRepository;
  articleRepository: KnowledgeArticleRepository;
  eventPublisher: DomainEventPublisher;
};

export type CreateVersionInput = {
  articleId: KnowledgeArticleId;
  summary: string;
  versionNumber?: number;
  id?: string;
  now?: Date;
};

export class KnowledgeVersionService {
  constructor(private readonly deps: KnowledgeVersionServiceDeps) {}

  async create(input: CreateVersionInput): Promise<KnowledgeVersion> {
    const article = await this.deps.articleRepository.findById(input.articleId);
    if (!article) {
      throw new KnowledgeArticleNotFoundError(input.articleId);
    }
    KnowledgeLifecyclePolicy.assertStructurallyEditable(article);

    const existing = await this.deps.versionRepository.findByArticle(
      input.articleId,
    );
    const latestNumber =
      existing.length === 0
        ? null
        : Math.max(...existing.map((v) => v.versionNumber));
    const nextNumber =
      input.versionNumber ?? (latestNumber === null ? 1 : latestNumber + 1);
    VersionPolicy.assertSequential(nextNumber, latestNumber);

    const props: CreateKnowledgeVersionProps = {
      organizationId: article.organizationId,
      articleId: input.articleId,
      versionNumber: nextNumber,
      summary: input.summary,
      id: input.id,
      now: input.now,
    };
    const version = KnowledgeVersion.create(props);
    await this.deps.versionRepository.save(version);
    await this.deps.eventPublisher.publish(version.pullDomainEvents());
    return version;
  }

  async approve(
    id: KnowledgeVersionId,
    now?: Date,
  ): Promise<KnowledgeVersion> {
    const version = await this.getById(id);
    VersionPolicy.assertCanTransition(version, VersionStatus.APPROVED);
    version.approve(now);
    await this.deps.versionRepository.update(version);
    await this.deps.eventPublisher.publish(version.pullDomainEvents());
    return version;
  }

  /**
   * Promote version to CURRENT, superseding any previous CURRENT version,
   * and set the article's currentVersionId.
   */
  async promoteCurrent(
    id: KnowledgeVersionId,
    now?: Date,
  ): Promise<KnowledgeVersion> {
    const version = await this.getById(id);
    const article = await this.deps.articleRepository.findById(
      version.articleId,
    );
    if (!article) {
      throw new KnowledgeArticleNotFoundError(version.articleId);
    }
    KnowledgeLifecyclePolicy.assertStructurallyEditable(article);
    VersionPolicy.assertCanPromote(version);

    const current = await this.deps.versionRepository.findCurrentVersion(
      version.articleId,
    );
    let previousVersionId: KnowledgeVersionId | null = null;
    if (current) {
      if (current.id === version.id) {
        throw new InvalidKnowledgeStateError(
          "Version is already the CURRENT version.",
        );
      }
      VersionPolicy.assertCanSupersede(current);
      previousVersionId = current.id;
      current.supersede(now);
      await this.deps.versionRepository.update(current);
      await this.deps.eventPublisher.publish(current.pullDomainEvents());
    }

    version.promote(previousVersionId, now);
    await this.deps.versionRepository.update(version);
    await this.deps.eventPublisher.publish(version.pullDomainEvents());

    article.setCurrentVersion(version.id, now);
    await this.deps.articleRepository.update(article);
    await this.deps.eventPublisher.publish(article.pullDomainEvents());

    return version;
  }

  async supersede(
    id: KnowledgeVersionId,
    now?: Date,
  ): Promise<KnowledgeVersion> {
    const version = await this.getById(id);
    VersionPolicy.assertCanSupersede(version);
    version.supersede(now);
    await this.deps.versionRepository.update(version);
    await this.deps.eventPublisher.publish(version.pullDomainEvents());
    return version;
  }

  async getById(id: KnowledgeVersionId): Promise<KnowledgeVersion> {
    const version = await this.deps.versionRepository.findById(id);
    if (!version) throw new KnowledgeVersionNotFoundError(id);
    return version;
  }

  async findCurrent(
    articleId: KnowledgeArticleId,
  ): Promise<KnowledgeVersion | null> {
    return this.deps.versionRepository.findCurrentVersion(articleId);
  }

  async listByArticle(
    articleId: KnowledgeArticleId,
  ): Promise<KnowledgeVersion[]> {
    return this.deps.versionRepository.findByArticle(articleId);
  }
}
