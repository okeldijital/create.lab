/**
 * @creative-lab/allocation
 *
 * Resource Allocation bounded context — EPIC-208.
 * Manages commitments between resources and work.
 * Answers: who is committed to what?
 * Does not answer capacity, scheduling, execution, or project ownership.
 */

export {
  Allocation,
  AllocationGroup,
  Reservation,
} from "./aggregates/index.js";
export type {
  CreateAllocationProps,
  AllocationSnapshot,
  CreateAllocationGroupProps,
  AllocationGroupSnapshot,
  CreateReservationProps,
  ReservationSnapshot,
} from "./aggregates/index.js";

export {
  AllocationPercentage,
  AllocationNotes,
  AllocationPriorityVO,
  ReservationPeriod,
  AllocationName,
  AllocationReason,
} from "./value-objects/index.js";

export {
  AllocationStatus,
  ALLOCATION_TRANSITIONS,
  canTransitionAllocation,
  isActiveAllocationStatus,
  ResourceType,
  AllocationPriority,
  ReservationStatus,
  RESERVATION_TRANSITIONS,
  canTransitionReservation,
} from "./enums/index.js";

export {
  AllocationCreated,
  AllocationUpdated,
  AllocationActivated,
  AllocationCompleted,
  AllocationCancelled,
  AllocationArchived,
  AllocationGroupCreated,
  AllocationGroupArchived,
  ReservationRequested,
  ReservationApproved,
  ReservationCancelled,
  ReservationConverted,
} from "./events/index.js";

export type {
  AllocationRepository,
  AllocationGroupRepository,
  ReservationRepository,
} from "./repositories/index.js";

export {
  AllocationService,
  AllocationGroupService,
  ReservationService,
} from "./services/index.js";
export type {
  AllocationServiceDeps,
  AllocationGroupServiceDeps,
  ReservationServiceDeps,
  ConvertReservationProps,
} from "./services/index.js";

export {
  AllocationPolicy,
  AllocationConflictPolicy,
  ReservationPolicy,
  AllocationGroupPolicy,
} from "./policies/index.js";

export {
  AllocationFactory,
  AllocationGroupFactory,
  ReservationFactory,
} from "./factories/index.js";

export {
  AllocationNotFoundError,
  DuplicateAllocationError,
  InvalidAllocationStateError,
  AllocationConflictError,
  InvalidAllocationPercentageError,
  ReservationNotFoundError,
  ReservationLifecycleError,
  AllocationGroupNotFoundError,
  DuplicateAllocationGroupError,
  AllocationValidationError,
} from "./errors/index.js";

export type {
  AllocationId,
  AllocationGroupId,
  ReservationId,
  ResourceAllocationId,
  OrganizationId,
  ProjectId,
  WorkOrderId,
  ResourceId,
} from "./types/index.js";
export {
  asAllocationId,
  asAllocationGroupId,
  asReservationId,
  asResourceAllocationId,
  asOrganizationId,
} from "./types/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export { rangesOverlap } from "./utils/index.js";
