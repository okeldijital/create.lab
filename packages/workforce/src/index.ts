/**
 * @creative-lab/workforce
 *
 * Workforce bounded context — EPIC-202.
 * Pure domain model for people, employment, positions, and reporting.
 * Organization-scoped. No identity/auth, scheduling, or infrastructure.
 */

export {
  Worker,
  Position,
  Employment,
  EmploymentContract,
  ReportingRelationship,
} from "./aggregates/index.js";
export type {
  CreateWorkerProps,
  WorkerSnapshot,
  CreatePositionProps,
  PositionSnapshot,
  CreateEmploymentProps,
  EmploymentSnapshot,
  CreateEmploymentContractProps,
  EmploymentContractSnapshot,
  CreateReportingRelationshipProps,
  ReportingRelationshipSnapshot,
} from "./aggregates/index.js";

export {
  WorkerName,
  EmailAddress,
  PhoneNumber,
  EmployeeNumber,
  EmploymentPeriod,
  WorkingHours,
  NoticePeriod,
  ProbationPeriod,
  PositionTitle,
} from "./value-objects/index.js";

export {
  WorkerStatus,
  WORKER_STATUS_TRANSITIONS,
  canTransitionWorkerStatus,
  EmploymentType,
  EmploymentStatus,
  ACTIVE_EMPLOYMENT_STATUSES,
  isActiveEmploymentStatus,
  ContractStatus,
  PositionStatus,
  ContractType,
} from "./enums/index.js";

export {
  DomainEvent,
  DOMAIN_EVENT_VERSION,
  WorkerCreated,
  WorkerUpdated,
  WorkerArchived,
  PositionCreated,
  PositionUpdated,
  PositionArchived,
  EmploymentStarted,
  EmploymentUpdated,
  EmploymentEnded,
  ContractCreated,
  ContractExpired,
  ManagerAssigned,
  ManagerChanged,
  ReportingRelationshipCreated,
  ReportingRelationshipEnded,
} from "./events/index.js";
export type { AnyDomainEvent, DomainEventProps } from "./events/index.js";

export type {
  WorkerRepository,
  PositionRepository,
  EmploymentRepository,
  EmploymentContractRepository,
  ReportingRelationshipRepository,
} from "./repositories/index.js";

export {
  WorkerService,
  PositionService,
  EmploymentService,
  EmploymentContractService,
  ReportingService,
} from "./services/index.js";
export type {
  WorkerServiceDeps,
  PositionServiceDeps,
  EmploymentServiceDeps,
  EmploymentContractServiceDeps,
  ReportingServiceDeps,
} from "./services/index.js";

export {
  ReportingHierarchyPolicy,
  EmploymentLifecyclePolicy,
  WorkerAssignmentPolicy,
  PositionAssignmentPolicy,
} from "./policies/index.js";
export type { ReportingNode } from "./policies/index.js";

export {
  WorkerFactory,
  PositionFactory,
  EmploymentFactory,
  EmploymentContractFactory,
  ReportingRelationshipFactory,
} from "./factories/index.js";

export {
  WorkerNotFoundError,
  DuplicateEmailError,
  DuplicateEmployeeNumberError,
  WorkerArchivedError,
  WorkerValidationError,
  InvalidEmploymentPeriodError,
  EmploymentConflictError,
  EmploymentNotFoundError,
  ContractConflictError,
  ContractNotFoundError,
  ReportingHierarchyError,
  InvalidManagerAssignmentError,
  PositionNotFoundError,
  DuplicatePositionError,
  PositionValidationError,
  InvalidWorkerStatusTransitionError,
} from "./errors/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export type {
  WorkerId,
  PositionId,
  EmploymentId,
  EmploymentContractId,
  ReportingRelationshipId,
  EventId,
  OrganizationId,
  DepartmentId,
  TeamId,
} from "./types/index.js";
export {
  asWorkerId,
  asPositionId,
  asEmploymentId,
  asEmploymentContractId,
  asReportingRelationshipId,
  asEventId,
  asOrganizationId,
  asDepartmentId,
  asTeamId,
} from "./types/index.js";
