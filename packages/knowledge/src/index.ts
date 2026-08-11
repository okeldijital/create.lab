/**
 * @creative-lab/knowledge
 *
 * Knowledge Management bounded context — EPIC-220.
 * Organizational knowledge identity, lifecycle, taxonomy, and governance.
 * No file storage, search, AI, documents, permissions, or notifications.
 */

export {
  KnowledgeArticle,
  KnowledgeVersion,
  KnowledgeCategory,
  KnowledgeReference,
} from "./aggregates/index.js";
export type {
  CreateKnowledgeArticleProps,
  KnowledgeArticleSnapshot,
  CreateKnowledgeVersionProps,
  KnowledgeVersionSnapshot,
  CreateKnowledgeCategoryProps,
  KnowledgeCategorySnapshot,
  CreateKnowledgeReferenceProps,
  KnowledgeReferenceSnapshot,
} from "./aggregates/index.js";

export {
  ArticleNumber,
  ArticleTitle,
  VersionNumber,
  CategoryName,
  KnowledgeSummary,
  KnowledgeDescription,
  ReferenceLabel,
} from "./value-objects/index.js";

export {
  KnowledgeStatus,
  KNOWLEDGE_TRANSITIONS,
  canTransitionKnowledge,
  VersionStatus,
  VERSION_TRANSITIONS,
  canTransitionVersion,
  CategoryStatus,
  RelationshipType,
  ReferenceStatus,
} from "./enums/index.js";

export {
  KnowledgeArticleCreated,
  KnowledgeSubmittedForReview,
  KnowledgeApproved,
  KnowledgeActivated,
  KnowledgeRetired,
  KnowledgeArchived,
  KnowledgeVersionCreated,
  KnowledgeVersionPromoted,
  KnowledgeCategoryCreated,
  KnowledgeCategoryArchived,
  KnowledgeReferenceCreated,
  KnowledgeReferenceRemoved,
} from "./events/index.js";

export type {
  KnowledgeArticleRepository,
  KnowledgeVersionRepository,
  KnowledgeCategoryRepository,
  KnowledgeReferenceRepository,
} from "./repositories/index.js";

export {
  KnowledgeArticleService,
  KnowledgeVersionService,
  KnowledgeCategoryService,
  KnowledgeReferenceService,
} from "./services/index.js";
export type {
  KnowledgeArticleServiceDeps,
  KnowledgeVersionServiceDeps,
  CreateVersionInput,
  KnowledgeCategoryServiceDeps,
  KnowledgeReferenceServiceDeps,
} from "./services/index.js";

export {
  KnowledgeLifecyclePolicy,
  VersionPolicy,
  CategoryPolicy,
  ReferencePolicy,
} from "./policies/index.js";

export {
  KnowledgeArticleFactory,
  KnowledgeVersionFactory,
  KnowledgeCategoryFactory,
  KnowledgeReferenceFactory,
} from "./factories/index.js";

export {
  KnowledgeArticleNotFoundError,
  KnowledgeVersionNotFoundError,
  KnowledgeCategoryNotFoundError,
  KnowledgeReferenceNotFoundError,
  DuplicateArticleNumberError,
  DuplicateCategoryNameError,
  DuplicateKnowledgeReferenceError,
  KnowledgeAlreadyActiveError,
  InvalidKnowledgeStateError,
  KnowledgeValidationError,
  CategoryInUseError,
} from "./errors/index.js";

export type {
  KnowledgeArticleId,
  KnowledgeVersionId,
  KnowledgeCategoryId,
  KnowledgeReferenceId,
} from "./types/index.js";
export {
  asKnowledgeArticleId,
  asKnowledgeVersionId,
  asKnowledgeCategoryId,
  asKnowledgeReferenceId,
} from "./types/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export { uniqueIds } from "./utils/index.js";
