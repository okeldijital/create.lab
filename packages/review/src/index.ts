/**
 * @creative-lab/review
 *
 * Review & Approval bounded context — EPIC-211.
 * Owns review lifecycle, approval workflows, sessions, and decisions.
 * Consumes Project, Production, and Asset as opaque references only.
 */

export {
  Review,
  Approval,
  ReviewSession,
  ReviewDecision,
} from "./aggregates/index.js";
export type {
  CreateReviewProps,
  ReviewSnapshot,
  CreateApprovalProps,
  ApprovalSnapshot,
  CreateReviewSessionProps,
  ReviewSessionSnapshot,
  CreateReviewDecisionProps,
  ReviewDecisionSnapshot,
} from "./aggregates/index.js";

export {
  ReviewTitle,
  ReviewDescription,
  ApprovalRequirement,
  ApprovalCount,
  DecisionNotes,
  ReviewerReference,
} from "./value-objects/index.js";

export {
  ReviewStatus,
  REVIEW_TRANSITIONS,
  canTransitionReview,
  ApprovalStatus,
  SessionStatus,
  SESSION_TRANSITIONS,
  canTransitionSession,
  isActiveSessionStatus,
  DecisionType,
} from "./enums/index.js";

export {
  ReviewCreated,
  ReviewStarted,
  ReviewApproved,
  ReviewRejected,
  ReviewArchived,
  ApprovalCreated,
  ApprovalCompleted,
  ApprovalRejected,
  ReviewSessionOpened,
  ReviewSessionCompleted,
  DecisionRecorded,
} from "./events/index.js";

export type {
  ReviewRepository,
  ApprovalRepository,
  ReviewSessionRepository,
  ReviewDecisionRepository,
} from "./repositories/index.js";

export {
  ReviewService,
  ApprovalService,
  ReviewSessionService,
  DecisionService,
} from "./services/index.js";
export type {
  ReviewServiceDeps,
  ApprovalServiceDeps,
  ReviewSessionServiceDeps,
  DecisionServiceDeps,
} from "./services/index.js";

export {
  ReviewLifecyclePolicy,
  ApprovalPolicy,
  SessionPolicy,
  DecisionPolicy,
} from "./policies/index.js";

export {
  ReviewFactory,
  ApprovalFactory,
  ReviewSessionFactory,
  ReviewDecisionFactory,
} from "./factories/index.js";

export {
  ReviewNotFoundError,
  ApprovalNotFoundError,
  SessionNotFoundError,
  DecisionNotFoundError,
  ReviewAlreadyApprovedError,
  ApprovalAlreadyCompletedError,
  InvalidReviewStateError,
  DuplicateDecisionError,
  ReviewValidationError,
  SessionAlreadyActiveError,
} from "./errors/index.js";

export type {
  ReviewId,
  ApprovalId,
  ReviewSessionId,
  ReviewDecisionId,
  OrganizationId,
  ProjectId,
  ProductionId,
  AssetId,
} from "./types/index.js";
export {
  asReviewId,
  asApprovalId,
  asReviewSessionId,
  asReviewDecisionId,
  asOrganizationId,
} from "./types/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export { uniqueIds } from "./utils/index.js";
