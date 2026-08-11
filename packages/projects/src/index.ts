/**
 * @creative-lab/projects
 *
 * Project Management bounded context — EPIC-207.
 * Business coordination layer tying planning and execution together.
 * Consumes Operations, Allocation, Scheduling, Capacity, Workforce, Organization, Core.
 */

export {
  Project,
  ProjectPhase,
  Deliverable,
  ProjectDependency,
  ProjectObjective,
} from "./aggregates/index.js";
export type {
  CreateProjectProps,
  ProjectSnapshot,
  CreateProjectPhaseProps,
  ProjectPhaseSnapshot,
  CreateDeliverableProps,
  DeliverableSnapshot,
  CreateProjectDependencyProps,
  ProjectDependencySnapshot,
  CreateProjectObjectiveProps,
  ProjectObjectiveSnapshot,
} from "./aggregates/index.js";

export {
  ProjectName,
  ProjectDescription,
  DeliverableName,
  PhaseName,
  ObjectiveName,
  ObjectiveProgress,
  BudgetReference,
  Priority,
} from "./value-objects/index.js";

export {
  ProjectStatus,
  PROJECT_TRANSITIONS,
  canTransitionProject,
  PhaseStatus,
  DeliverableStatus,
  DELIVERABLE_TRANSITIONS,
  canTransitionDeliverable,
  ObjectiveStatus,
  DependencyType,
  DependencyStatus,
  ProjectType,
  ProjectPriority,
} from "./enums/index.js";

export {
  ProjectCreated,
  ProjectStarted,
  ProjectCompleted,
  ProjectClosed,
  PhaseStarted,
  PhaseCompleted,
  DeliverableCreated,
  DeliverableCompleted,
  ObjectiveAchieved,
  DependencyCreated,
} from "./events/index.js";

export type {
  ProjectRepository,
  ProjectPhaseRepository,
  DeliverableRepository,
  ProjectDependencyRepository,
  ProjectObjectiveRepository,
} from "./repositories/index.js";

export {
  ProjectService,
  PhaseService,
  DeliverableService,
  DependencyService,
  ObjectiveService,
} from "./services/index.js";
export type {
  ProjectServiceDeps,
  PhaseServiceDeps,
  DeliverableServiceDeps,
  DependencyServiceDeps,
  ObjectiveServiceDeps,
} from "./services/index.js";

export {
  ProjectLifecyclePolicy,
  PhasePolicy,
  DeliverablePolicy,
  DependencyPolicy,
  ObjectivePolicy,
} from "./policies/index.js";

export {
  ProjectFactory,
  ProjectPhaseFactory,
  DeliverableFactory,
  ProjectDependencyFactory,
  ProjectObjectiveFactory,
} from "./factories/index.js";

export {
  ProjectNotFoundError,
  DuplicateProjectError,
  InvalidProjectStateError,
  PhaseSequenceError,
  DuplicateDeliverableError,
  DependencyCycleError,
  SelfDependencyError,
  ObjectiveAlreadyCompletedError,
  ProjectPhaseNotFoundError,
  DeliverableNotFoundError,
  ProjectDependencyNotFoundError,
  ProjectObjectiveNotFoundError,
  DuplicatePhaseError,
  DuplicateObjectiveError,
  ProjectValidationError,
} from "./errors/index.js";

export type {
  ProjectId,
  ProjectPhaseId,
  DeliverableId,
  ProjectDependencyId,
  ProjectObjectiveId,
  OrganizationId,
  WorkOrderId,
  BookingId,
} from "./types/index.js";
export {
  asProjectId,
  asProjectPhaseId,
  asDeliverableId,
  asProjectDependencyId,
  asProjectObjectiveId,
  asOrganizationId,
} from "./types/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export { wouldCreateCycle } from "./utils/index.js";
