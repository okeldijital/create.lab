/**
 * @creative-lab/production
 *
 * Production Management bounded context — EPIC-209.
 * Owns production execution lifecycle: sessions, milestones, revisions.
 * Consumes Project and WorkOrder as opaque references only.
 */

export {
  Production,
  ProductionSession,
  ProductionMilestone,
  Revision,
} from "./aggregates/index.js";
export type {
  CreateProductionProps,
  ProductionSnapshot,
  CreateProductionSessionProps,
  ProductionSessionSnapshot,
  CreateProductionMilestoneProps,
  ProductionMilestoneSnapshot,
  CreateRevisionProps,
  RevisionSnapshot,
} from "./aggregates/index.js";

export {
  ProductionName,
  ProductionDescription,
  SessionNotes,
  MilestoneName,
  RevisionReason,
  RevisionNumber,
  ProductionPriorityVO,
  SessionDuration,
} from "./value-objects/index.js";

export {
  ProductionStatus,
  PRODUCTION_TRANSITIONS,
  canTransitionProduction,
  SessionStatus,
  SESSION_TRANSITIONS,
  canTransitionSession,
  isOpenSessionStatus,
  MilestoneStatus,
  RevisionStatus,
  REVISION_TRANSITIONS,
  canTransitionRevision,
  ProductionPriority,
} from "./enums/index.js";

export {
  ProductionCreated,
  ProductionStarted,
  ProductionPaused,
  ProductionResumed,
  ProductionCompleted,
  ProductionArchived,
  SessionOpened,
  SessionPaused,
  SessionResumed,
  SessionCompleted,
  MilestoneCreated,
  MilestoneActivated,
  MilestoneCompleted,
  RevisionRequested,
  RevisionStarted,
  RevisionCompleted,
  RevisionClosed,
} from "./events/index.js";

export type {
  ProductionRepository,
  SessionRepository,
  MilestoneRepository,
  RevisionRepository,
} from "./repositories/index.js";

export {
  ProductionService,
  SessionService,
  MilestoneService,
  RevisionService,
} from "./services/index.js";
export type {
  ProductionServiceDeps,
  SessionServiceDeps,
  MilestoneServiceDeps,
  RevisionServiceDeps,
  RequestRevisionProps,
} from "./services/index.js";

export {
  ProductionLifecyclePolicy,
  SessionPolicy,
  MilestonePolicy,
  RevisionPolicy,
} from "./policies/index.js";

export {
  ProductionFactory,
  ProductionSessionFactory,
  ProductionMilestoneFactory,
  RevisionFactory,
} from "./factories/index.js";

export {
  ProductionNotFoundError,
  DuplicateProductionError,
  InvalidProductionStateError,
  SessionAlreadyOpenError,
  SessionNotOpenError,
  InvalidSessionError,
  MilestoneSequenceError,
  DuplicateMilestoneError,
  RevisionLifecycleError,
  DuplicateRevisionError,
  SessionNotFoundError,
  MilestoneNotFoundError,
  RevisionNotFoundError,
  ProductionValidationError,
} from "./errors/index.js";

export type {
  ProductionId,
  ProductionSessionId,
  ProductionMilestoneId,
  RevisionId,
  OrganizationId,
  ProjectId,
  WorkOrderId,
} from "./types/index.js";
export {
  asProductionId,
  asProductionSessionId,
  asProductionMilestoneId,
  asRevisionId,
  asOrganizationId,
} from "./types/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export { durationMs } from "./utils/index.js";
