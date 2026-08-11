import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import {
  VersionStatus,
  canTransitionVersion,
} from "../../enums/VersionStatus.js";
import { InvalidKnowledgeStateError } from "../../errors/KnowledgeErrors.js";
import {
  KnowledgeVersionCreated,
  KnowledgeVersionPromoted,
} from "../../events/knowledge-events.js";
import {
  asKnowledgeVersionId,
  type KnowledgeArticleId,
  type KnowledgeVersionId,
} from "../../types/ids.js";
import { KnowledgeSummary } from "../../value-objects/KnowledgeSummary.js";
import { VersionNumber } from "../../value-objects/VersionNumber.js";

export type CreateKnowledgeVersionProps = {
  organizationId: OrganizationId;
  articleId: KnowledgeArticleId;
  versionNumber: number;
  summary: string;
  id?: string;
  now?: Date;
};

export type KnowledgeVersionSnapshot = {
  id: KnowledgeVersionId;
  organizationId: OrganizationId;
  articleId: KnowledgeArticleId;
  versionNumber: number;
  summary: string;
  status: VersionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export class KnowledgeVersion extends AggregateRoot<KnowledgeVersionId> {
  private constructor(
    id: KnowledgeVersionId,
    private readonly _organizationId: OrganizationId,
    private readonly _articleId: KnowledgeArticleId,
    private readonly _versionNumber: VersionNumber,
    private readonly _summary: KnowledgeSummary,
    private _status: VersionStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateKnowledgeVersionProps): KnowledgeVersion {
    if (!props.articleId) {
      throw new InvalidKnowledgeStateError("Version requires an article.");
    }
    const now = props.now ?? new Date();
    const id = asKnowledgeVersionId(props.id ?? generateId());
    const version = new KnowledgeVersion(
      id,
      props.organizationId,
      props.articleId,
      VersionNumber.create(props.versionNumber),
      KnowledgeSummary.create(props.summary),
      VersionStatus.DRAFT,
      now,
      now,
    );
    version.record(
      KnowledgeVersionCreated.create({
        organizationId: props.organizationId,
        versionId: id,
        articleId: props.articleId,
        versionNumber: props.versionNumber,
        status: VersionStatus.DRAFT,
        occurredAt: now,
      }),
    );
    return version;
  }

  static reconstitute(snapshot: KnowledgeVersionSnapshot): KnowledgeVersion {
    return new KnowledgeVersion(
      snapshot.id,
      snapshot.organizationId,
      snapshot.articleId,
      VersionNumber.create(snapshot.versionNumber),
      KnowledgeSummary.create(snapshot.summary),
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get articleId(): KnowledgeArticleId {
    return this._articleId;
  }
  get versionNumber(): number {
    return this._versionNumber.value;
  }
  get summary(): KnowledgeSummary {
    return this._summary;
  }
  get status(): VersionStatus {
    return this._status;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isCurrent(): boolean {
    return this._status === VersionStatus.CURRENT;
  }
  get isSuperseded(): boolean {
    return this._status === VersionStatus.SUPERSEDED;
  }

  approve(now: Date = new Date()): void {
    this.transitionTo(VersionStatus.APPROVED, now);
  }

  promote(
    previousVersionId: KnowledgeVersionId | null,
    now: Date = new Date(),
  ): void {
    this.transitionTo(VersionStatus.CURRENT, now);
    this.record(
      KnowledgeVersionPromoted.create({
        organizationId: this._organizationId,
        versionId: this.id,
        articleId: this._articleId,
        previousVersionId,
        occurredAt: now,
      }),
    );
  }

  supersede(now: Date = new Date()): void {
    this.transitionTo(VersionStatus.SUPERSEDED, now);
  }

  toSnapshot(): KnowledgeVersionSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      articleId: this._articleId,
      versionNumber: this._versionNumber.value,
      summary: this._summary.value,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private transitionTo(to: VersionStatus, now: Date): void {
    if (this._status === VersionStatus.CURRENT && to !== VersionStatus.SUPERSEDED) {
      throw new InvalidKnowledgeStateError(
        "CURRENT versions are immutable except supersession.",
      );
    }
    if (this._status === VersionStatus.SUPERSEDED) {
      throw new InvalidKnowledgeStateError(
        "Superseded versions are immutable.",
      );
    }
    if (!canTransitionVersion(this._status, to)) {
      throw new InvalidKnowledgeStateError(
        `Cannot transition version from ${this._status} to ${to}.`,
      );
    }
    this._status = to;
    this._updatedAt = now;
  }
}
