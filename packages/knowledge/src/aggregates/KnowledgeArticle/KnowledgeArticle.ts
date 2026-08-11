import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import {
  KnowledgeStatus,
  canTransitionKnowledge,
} from "../../enums/KnowledgeStatus.js";
import {
  InvalidKnowledgeStateError,
  KnowledgeAlreadyActiveError,
} from "../../errors/KnowledgeErrors.js";
import {
  KnowledgeActivated,
  KnowledgeApproved,
  KnowledgeArchived,
  KnowledgeArticleCreated,
  KnowledgeRetired,
  KnowledgeSubmittedForReview,
} from "../../events/knowledge-events.js";
import {
  asKnowledgeArticleId,
  type KnowledgeArticleId,
  type KnowledgeCategoryId,
  type KnowledgeReferenceId,
  type KnowledgeVersionId,
} from "../../types/ids.js";
import { ArticleNumber } from "../../value-objects/ArticleNumber.js";
import { ArticleTitle } from "../../value-objects/ArticleTitle.js";
import { KnowledgeDescription } from "../../value-objects/KnowledgeDescription.js";

export type CreateKnowledgeArticleProps = {
  organizationId: OrganizationId;
  title: string;
  description?: string | null;
  categoryId: KnowledgeCategoryId;
  articleNumber?: string;
  id?: string;
  now?: Date;
};

export type KnowledgeArticleSnapshot = {
  id: KnowledgeArticleId;
  organizationId: OrganizationId;
  articleNumber: string;
  title: string;
  description: string | null;
  categoryId: KnowledgeCategoryId;
  currentVersionId: string | null;
  referenceIds: string[];
  status: KnowledgeStatus;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

export class KnowledgeArticle extends AggregateRoot<KnowledgeArticleId> {
  private constructor(
    id: KnowledgeArticleId,
    private readonly _organizationId: OrganizationId,
    private readonly _articleNumber: ArticleNumber,
    private _title: ArticleTitle,
    private _description: KnowledgeDescription,
    private _categoryId: KnowledgeCategoryId,
    private _currentVersionId: KnowledgeVersionId | null,
    private _referenceIds: KnowledgeReferenceId[],
    private _status: KnowledgeStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreateKnowledgeArticleProps): KnowledgeArticle {
    if (!props.organizationId) {
      throw new InvalidKnowledgeStateError(
        "Article requires an organization.",
      );
    }
    if (!props.categoryId) {
      throw new InvalidKnowledgeStateError("Article requires a category.");
    }
    const now = props.now ?? new Date();
    const id = asKnowledgeArticleId(props.id ?? generateId());
    const number = props.articleNumber
      ? ArticleNumber.create(props.articleNumber)
      : ArticleNumber.generate(now);
    const article = new KnowledgeArticle(
      id,
      props.organizationId,
      number,
      ArticleTitle.create(props.title),
      KnowledgeDescription.create(props.description),
      props.categoryId,
      null,
      [],
      KnowledgeStatus.DRAFT,
      now,
      now,
      null,
    );
    article.record(
      KnowledgeArticleCreated.create({
        organizationId: props.organizationId,
        articleId: id,
        articleNumber: number.value,
        title: article.title.value,
        status: KnowledgeStatus.DRAFT,
        occurredAt: now,
      }),
    );
    return article;
  }

  static reconstitute(snapshot: KnowledgeArticleSnapshot): KnowledgeArticle {
    return new KnowledgeArticle(
      snapshot.id,
      snapshot.organizationId,
      ArticleNumber.create(snapshot.articleNumber),
      ArticleTitle.create(snapshot.title),
      KnowledgeDescription.create(snapshot.description),
      snapshot.categoryId,
      (snapshot.currentVersionId as KnowledgeVersionId | null) ?? null,
      snapshot.referenceIds as KnowledgeReferenceId[],
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.archivedAt ? new Date(snapshot.archivedAt) : null,
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get articleNumber(): ArticleNumber {
    return this._articleNumber;
  }
  get title(): ArticleTitle {
    return this._title;
  }
  get description(): KnowledgeDescription {
    return this._description;
  }
  get categoryId(): KnowledgeCategoryId {
    return this._categoryId;
  }
  get currentVersionId(): KnowledgeVersionId | null {
    return this._currentVersionId;
  }
  get referenceIds(): readonly KnowledgeReferenceId[] {
    return [...this._referenceIds];
  }
  get status(): KnowledgeStatus {
    return this._status;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get archivedAt(): Date | null {
    return this._archivedAt ? new Date(this._archivedAt) : null;
  }
  get isDraft(): boolean {
    return this._status === KnowledgeStatus.DRAFT;
  }
  get isActive(): boolean {
    return this._status === KnowledgeStatus.ACTIVE;
  }
  get isRetired(): boolean {
    return this._status === KnowledgeStatus.RETIRED;
  }
  get isArchived(): boolean {
    return this._status === KnowledgeStatus.ARCHIVED;
  }

  setCurrentVersion(
    versionId: KnowledgeVersionId,
    now: Date = new Date(),
  ): void {
    this.assertStructurallyEditable();
    this._currentVersionId = versionId;
    this._updatedAt = now;
  }

  addReferenceId(id: KnowledgeReferenceId, now: Date = new Date()): void {
    this.assertStructurallyEditable();
    if (!this._referenceIds.includes(id)) {
      this._referenceIds = [...this._referenceIds, id];
      this._updatedAt = now;
    }
  }

  removeReferenceId(id: KnowledgeReferenceId, now: Date = new Date()): void {
    this.assertStructurallyEditable();
    this._referenceIds = this._referenceIds.filter((x) => x !== id);
    this._updatedAt = now;
  }

  setCategory(
    categoryId: KnowledgeCategoryId,
    now: Date = new Date(),
  ): void {
    this.assertStructurallyEditable();
    if (
      this._status === KnowledgeStatus.ACTIVE ||
      this._status === KnowledgeStatus.RETIRED
    ) {
      throw new InvalidKnowledgeStateError(
        "Category is immutable once the article is ACTIVE.",
      );
    }
    this._categoryId = categoryId;
    this._updatedAt = now;
  }

  submitForReview(now: Date = new Date()): void {
    this.transitionTo(KnowledgeStatus.REVIEW, now);
    this.record(
      KnowledgeSubmittedForReview.create({
        organizationId: this._organizationId,
        articleId: this.id,
        occurredAt: now,
      }),
    );
  }

  approve(now: Date = new Date()): void {
    this.transitionTo(KnowledgeStatus.APPROVED, now);
    this.record(
      KnowledgeApproved.create({
        organizationId: this._organizationId,
        articleId: this.id,
        occurredAt: now,
      }),
    );
  }

  activate(now: Date = new Date()): void {
    if (this._status === KnowledgeStatus.ACTIVE) {
      throw new KnowledgeAlreadyActiveError(this.id);
    }
    if (!this._currentVersionId) {
      throw new InvalidKnowledgeStateError(
        "Cannot activate article without a current version.",
      );
    }
    this.transitionTo(KnowledgeStatus.ACTIVE, now);
    this.record(
      KnowledgeActivated.create({
        organizationId: this._organizationId,
        articleId: this.id,
        occurredAt: now,
      }),
    );
  }

  retire(now: Date = new Date()): void {
    this.transitionTo(KnowledgeStatus.RETIRED, now);
    this.record(
      KnowledgeRetired.create({
        organizationId: this._organizationId,
        articleId: this.id,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === KnowledgeStatus.ARCHIVED) {
      throw new InvalidKnowledgeStateError("Article already archived.");
    }
    this.transitionTo(KnowledgeStatus.ARCHIVED, now);
    this._archivedAt = now;
    this.record(
      KnowledgeArchived.create({
        organizationId: this._organizationId,
        articleId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): KnowledgeArticleSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      articleNumber: this._articleNumber.value,
      title: this._title.value,
      description: this._description.value,
      categoryId: this._categoryId,
      currentVersionId: this._currentVersionId,
      referenceIds: this._referenceIds.map(String),
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
    };
  }

  private transitionTo(to: KnowledgeStatus, now: Date): void {
    this.assertMutable();
    if (!canTransitionKnowledge(this._status, to)) {
      throw new InvalidKnowledgeStateError(
        `Cannot transition article from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertMutable(): void {
    if (this._status === KnowledgeStatus.ARCHIVED) {
      throw new InvalidKnowledgeStateError(
        "Archived articles are immutable.",
      );
    }
  }

  private assertStructurallyEditable(): void {
    if (this._status === KnowledgeStatus.ARCHIVED) {
      throw new InvalidKnowledgeStateError(
        "Archived articles are immutable.",
      );
    }
    if (this._status === KnowledgeStatus.RETIRED) {
      throw new InvalidKnowledgeStateError(
        "Retired articles only allow archive.",
      );
    }
  }
}
