import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { KnowledgeStatus } from "../enums/KnowledgeStatus.js";
import type { VersionStatus } from "../enums/VersionStatus.js";
import type { RelationshipType } from "../enums/RelationshipType.js";
import type {
  KnowledgeArticleId,
  KnowledgeCategoryId,
  KnowledgeReferenceId,
  KnowledgeVersionId,
} from "../types/ids.js";

export class KnowledgeArticleCreated extends DomainEvent<
  "KnowledgeArticleCreated",
  Readonly<{
    articleId: string;
    articleNumber: string;
    title: string;
    status: KnowledgeStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    articleId: KnowledgeArticleId;
    articleNumber: string;
    title: string;
    status: KnowledgeStatus;
    occurredAt?: Date;
  }): KnowledgeArticleCreated {
    return new KnowledgeArticleCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "KnowledgeArticleCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.articleId,
      organizationId: input.organizationId,
      payload: {
        articleId: input.articleId,
        articleNumber: input.articleNumber,
        title: input.title,
        status: input.status,
      },
    });
  }
}

export class KnowledgeSubmittedForReview extends DomainEvent<
  "KnowledgeSubmittedForReview",
  Readonly<{ articleId: string }>
> {
  static create(input: {
    organizationId: string;
    articleId: KnowledgeArticleId;
    occurredAt?: Date;
  }): KnowledgeSubmittedForReview {
    return new KnowledgeSubmittedForReview({
      eventId: DomainEvent.nextEventId(),
      eventType: "KnowledgeSubmittedForReview",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.articleId,
      organizationId: input.organizationId,
      payload: { articleId: input.articleId },
    });
  }
}

export class KnowledgeApproved extends DomainEvent<
  "KnowledgeApproved",
  Readonly<{ articleId: string }>
> {
  static create(input: {
    organizationId: string;
    articleId: KnowledgeArticleId;
    occurredAt?: Date;
  }): KnowledgeApproved {
    return new KnowledgeApproved({
      eventId: DomainEvent.nextEventId(),
      eventType: "KnowledgeApproved",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.articleId,
      organizationId: input.organizationId,
      payload: { articleId: input.articleId },
    });
  }
}

export class KnowledgeActivated extends DomainEvent<
  "KnowledgeActivated",
  Readonly<{ articleId: string }>
> {
  static create(input: {
    organizationId: string;
    articleId: KnowledgeArticleId;
    occurredAt?: Date;
  }): KnowledgeActivated {
    return new KnowledgeActivated({
      eventId: DomainEvent.nextEventId(),
      eventType: "KnowledgeActivated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.articleId,
      organizationId: input.organizationId,
      payload: { articleId: input.articleId },
    });
  }
}

export class KnowledgeRetired extends DomainEvent<
  "KnowledgeRetired",
  Readonly<{ articleId: string }>
> {
  static create(input: {
    organizationId: string;
    articleId: KnowledgeArticleId;
    occurredAt?: Date;
  }): KnowledgeRetired {
    return new KnowledgeRetired({
      eventId: DomainEvent.nextEventId(),
      eventType: "KnowledgeRetired",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.articleId,
      organizationId: input.organizationId,
      payload: { articleId: input.articleId },
    });
  }
}

export class KnowledgeArchived extends DomainEvent<
  "KnowledgeArchived",
  Readonly<{ articleId: string }>
> {
  static create(input: {
    organizationId: string;
    articleId: KnowledgeArticleId;
    occurredAt?: Date;
  }): KnowledgeArchived {
    return new KnowledgeArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "KnowledgeArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.articleId,
      organizationId: input.organizationId,
      payload: { articleId: input.articleId },
    });
  }
}

export class KnowledgeVersionCreated extends DomainEvent<
  "KnowledgeVersionCreated",
  Readonly<{
    versionId: string;
    articleId: string;
    versionNumber: number;
    status: VersionStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    versionId: KnowledgeVersionId;
    articleId: KnowledgeArticleId;
    versionNumber: number;
    status: VersionStatus;
    occurredAt?: Date;
  }): KnowledgeVersionCreated {
    return new KnowledgeVersionCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "KnowledgeVersionCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.versionId,
      organizationId: input.organizationId,
      payload: {
        versionId: input.versionId,
        articleId: input.articleId,
        versionNumber: input.versionNumber,
        status: input.status,
      },
    });
  }
}

export class KnowledgeVersionPromoted extends DomainEvent<
  "KnowledgeVersionPromoted",
  Readonly<{
    versionId: string;
    articleId: string;
    previousVersionId: string | null;
  }>
> {
  static create(input: {
    organizationId: string;
    versionId: KnowledgeVersionId;
    articleId: KnowledgeArticleId;
    previousVersionId: KnowledgeVersionId | null;
    occurredAt?: Date;
  }): KnowledgeVersionPromoted {
    return new KnowledgeVersionPromoted({
      eventId: DomainEvent.nextEventId(),
      eventType: "KnowledgeVersionPromoted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.versionId,
      organizationId: input.organizationId,
      payload: {
        versionId: input.versionId,
        articleId: input.articleId,
        previousVersionId: input.previousVersionId,
      },
    });
  }
}

export class KnowledgeCategoryCreated extends DomainEvent<
  "KnowledgeCategoryCreated",
  Readonly<{ categoryId: string; name: string }>
> {
  static create(input: {
    organizationId: string;
    categoryId: KnowledgeCategoryId;
    name: string;
    occurredAt?: Date;
  }): KnowledgeCategoryCreated {
    return new KnowledgeCategoryCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "KnowledgeCategoryCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.categoryId,
      organizationId: input.organizationId,
      payload: {
        categoryId: input.categoryId,
        name: input.name,
      },
    });
  }
}

export class KnowledgeCategoryArchived extends DomainEvent<
  "KnowledgeCategoryArchived",
  Readonly<{ categoryId: string }>
> {
  static create(input: {
    organizationId: string;
    categoryId: KnowledgeCategoryId;
    occurredAt?: Date;
  }): KnowledgeCategoryArchived {
    return new KnowledgeCategoryArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "KnowledgeCategoryArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.categoryId,
      organizationId: input.organizationId,
      payload: { categoryId: input.categoryId },
    });
  }
}

export class KnowledgeReferenceCreated extends DomainEvent<
  "KnowledgeReferenceCreated",
  Readonly<{
    referenceId: string;
    sourceArticleId: string;
    targetArticleId: string;
    relationshipType: RelationshipType;
  }>
> {
  static create(input: {
    organizationId: string;
    referenceId: KnowledgeReferenceId;
    sourceArticleId: KnowledgeArticleId;
    targetArticleId: KnowledgeArticleId;
    relationshipType: RelationshipType;
    occurredAt?: Date;
  }): KnowledgeReferenceCreated {
    return new KnowledgeReferenceCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "KnowledgeReferenceCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.referenceId,
      organizationId: input.organizationId,
      payload: {
        referenceId: input.referenceId,
        sourceArticleId: input.sourceArticleId,
        targetArticleId: input.targetArticleId,
        relationshipType: input.relationshipType,
      },
    });
  }
}

export class KnowledgeReferenceRemoved extends DomainEvent<
  "KnowledgeReferenceRemoved",
  Readonly<{ referenceId: string }>
> {
  static create(input: {
    organizationId: string;
    referenceId: KnowledgeReferenceId;
    occurredAt?: Date;
  }): KnowledgeReferenceRemoved {
    return new KnowledgeReferenceRemoved({
      eventId: DomainEvent.nextEventId(),
      eventType: "KnowledgeReferenceRemoved",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.referenceId,
      organizationId: input.organizationId,
      payload: { referenceId: input.referenceId },
    });
  }
}
