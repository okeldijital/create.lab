/**
 * @creative-lab/operations
 *
 * Operations (Work Execution) bounded context — EPIC-206.
 * Models what actually happened after planning ends.
 * Consumes Allocation, Scheduling, Capacity, Workforce, Organization, Core.
 */

export {
  WorkOrder,
  WorkSession,
  WorkMilestone,
  WorkOutput,
  WorkIncident,
} from "./aggregates/index.js";
export type {
  CreateWorkOrderProps,
  WorkOrderSnapshot,
  CreateWorkSessionProps,
  WorkSessionSnapshot,
  CreateWorkMilestoneProps,
  WorkMilestoneSnapshot,
  CreateWorkOutputProps,
  WorkOutputSnapshot,
  CreateWorkIncidentProps,
  WorkIncidentSnapshot,
} from "./aggregates/index.js";

export {
  WorkTitle,
  WorkDescription,
  MilestoneName,
  OutputName,
  OutputVersion,
  SessionDuration,
  IncidentDescription,
  ResolutionNotes,
  Priority,
} from "./value-objects/index.js";

export {
  WorkOrderStatus,
  WORK_ORDER_TRANSITIONS,
  canTransitionWorkOrder,
  SessionStatus,
  OutputStatus,
  OutputType,
  IncidentSeverity,
  IncidentType,
  WorkPriority,
} from "./enums/index.js";

export {
  WorkOrderCreated,
  WorkStarted,
  WorkPaused,
  WorkCompleted,
  WorkClosed,
  SessionStarted,
  SessionEnded,
  MilestoneCompleted,
  OutputCreated,
  OutputApproved,
  IncidentReported,
  IncidentResolved,
} from "./events/index.js";

export type {
  WorkOrderRepository,
  WorkSessionRepository,
  WorkMilestoneRepository,
  WorkOutputRepository,
  WorkIncidentRepository,
} from "./repositories/index.js";

export {
  WorkOrderService,
  WorkSessionService,
  MilestoneService,
  OutputService,
  IncidentService,
} from "./services/index.js";
export type {
  WorkOrderServiceDeps,
  WorkSessionServiceDeps,
  MilestoneServiceDeps,
  OutputServiceDeps,
  IncidentServiceDeps,
} from "./services/index.js";

export {
  WorkLifecyclePolicy,
  SessionPolicy,
  MilestonePolicy,
  OutputPolicy,
  IncidentPolicy,
} from "./policies/index.js";
export type { SessionInterval } from "./policies/index.js";

export {
  WorkOrderFactory,
  WorkSessionFactory,
  WorkMilestoneFactory,
  WorkOutputFactory,
  WorkIncidentFactory,
} from "./factories/index.js";

export {
  WorkOrderNotFoundError,
  InvalidWorkStateError,
  SessionOverlapError,
  MilestoneAlreadyCompletedError,
  DuplicateMilestoneError,
  OutputVersionConflictError,
  IncidentAlreadyResolvedError,
  InvalidIncidentStateError,
  WorkSessionNotFoundError,
  WorkMilestoneNotFoundError,
  WorkOutputNotFoundError,
  WorkIncidentNotFoundError,
  OperationsValidationError,
} from "./errors/index.js";

export type {
  WorkOrderId,
  WorkSessionId,
  WorkMilestoneId,
  WorkOutputId,
  WorkIncidentId,
  OrganizationId,
  BookingId,
  AllocationId,
} from "./types/index.js";
export {
  asWorkOrderId,
  asWorkSessionId,
  asWorkMilestoneId,
  asWorkOutputId,
  asWorkIncidentId,
  asAllocationId,
  asOrganizationId,
} from "./types/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export { rangesOverlap, durationMs } from "./utils/index.js";
