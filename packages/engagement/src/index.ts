/**
 * @creative-lab/engagement
 *
 * Engagement Management bounded context — EPIC-218.
 * Contractual execution layer: engagements, deliverables, milestones, obligations.
 * No work orders, scheduling, allocation, production, or billing.
 */

export {
  Engagement,
  Deliverable,
  Milestone,
  Obligation,
} from "./aggregates/index.js";
export type {
  CreateEngagementProps,
  EngagementSnapshot,
  CreateDeliverableProps,
  DeliverableSnapshot,
  CreateMilestoneProps,
  MilestoneSnapshot,
  CreateObligationProps,
  ObligationSnapshot,
} from "./aggregates/index.js";

export {
  EngagementNumber,
  DeliverableTitle,
  MilestoneTitle,
  ObligationTitle,
  EngagementDescription,
  TargetDate,
  SequenceNumber,
} from "./value-objects/index.js";

export {
  EngagementStatus,
  ENGAGEMENT_TRANSITIONS,
  canTransitionEngagement,
  DeliverableStatus,
  DELIVERABLE_TRANSITIONS,
  canTransitionDeliverable,
  MilestoneStatus,
  MILESTONE_TRANSITIONS,
  canTransitionMilestone,
  ObligationStatus,
  ObligationParty,
} from "./enums/index.js";

export {
  EngagementCreated,
  EngagementActivated,
  EngagementSuspended,
  EngagementCompleted,
  EngagementCancelled,
  EngagementArchived,
  DeliverableCreated,
  DeliverableCompleted,
  DeliverableAccepted,
  MilestoneCreated,
  MilestoneActivated,
  MilestoneCompleted,
  ObligationCreated,
  ObligationFulfilled,
  ObligationWaived,
} from "./events/index.js";

export type {
  EngagementRepository,
  DeliverableRepository,
  MilestoneRepository,
  ObligationRepository,
} from "./repositories/index.js";

export {
  EngagementService,
  DeliverableService,
  MilestoneService,
  ObligationService,
} from "./services/index.js";
export type {
  EngagementServiceDeps,
  DeliverableServiceDeps,
  AddDeliverableProps,
  MilestoneServiceDeps,
  AddMilestoneProps,
  ObligationServiceDeps,
  AddObligationProps,
} from "./services/index.js";

export {
  EngagementLifecyclePolicy,
  DeliverablePolicy,
  MilestonePolicy,
  ObligationPolicy,
} from "./policies/index.js";

export {
  EngagementFactory,
  DeliverableFactory,
  MilestoneFactory,
  ObligationFactory,
} from "./factories/index.js";

export {
  EngagementNotFoundError,
  DuplicateEngagementNumberError,
  DeliverableNotFoundError,
  MilestoneNotFoundError,
  ObligationNotFoundError,
  InvalidEngagementStateError,
  DeliverableAlreadyAcceptedError,
  MilestoneSequenceError,
  ObligationAlreadyFulfilledError,
  EngagementValidationError,
} from "./errors/index.js";

export type {
  EngagementId,
  DeliverableId,
  MilestoneId,
  ObligationId,
  OrganizationId,
  CustomerId,
  ContractId,
  ProjectId,
} from "./types/index.js";
export {
  asEngagementId,
  asDeliverableId,
  asMilestoneId,
  asObligationId,
  asOrganizationId,
} from "./types/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export { uniqueIds } from "./utils/index.js";
