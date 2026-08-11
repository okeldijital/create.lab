/**
 * @creative-lab/capacity
 *
 * Capacity bounded context — EPIC-203.
 * Resource planning model: capability, availability templates, working
 * patterns, and measurable capacity. No scheduling or assignment.
 */

export {
  CapacityProfile,
  Capability,
  AvailabilityProfile,
  WorkingPattern,
  ResourceCapacity,
} from "./aggregates/index.js";
export type {
  CreateCapacityProfileProps,
  CapacityProfileSnapshot,
  CreateCapabilityProps,
  CapabilitySnapshot,
  CreateAvailabilityProfileProps,
  AvailabilityProfileSnapshot,
  AvailabilityException,
  CreateWorkingPatternProps,
  WorkingPatternSnapshot,
  CreateResourceCapacityProps,
  ResourceCapacitySnapshot,
} from "./aggregates/index.js";

export {
  CapacityQuantity,
  HoursPerWeek,
  HoursPerDay,
  CapabilityName,
  WorkingDaySet,
  Weekday,
  WorkingHours,
  Timezone,
  ProficiencyLevel,
} from "./value-objects/index.js";

export {
  CapacityStatus,
  ResourceType,
  CapacityUnit,
  CapabilityLevel,
} from "./enums/index.js";

export {
  CapacityProfileCreated,
  CapacityProfileUpdated,
  CapacityProfileArchived,
  CapabilityAdded,
  CapabilityRemoved,
  AvailabilityProfileCreated,
  AvailabilityProfileUpdated,
  WorkingPatternCreated,
  WorkingPatternUpdated,
  ResourceCapacityUpdated,
} from "./events/index.js";

export type {
  CapacityProfileRepository,
  CapabilityRepository,
  AvailabilityProfileRepository,
  WorkingPatternRepository,
  ResourceCapacityRepository,
} from "./repositories/index.js";

export {
  CapacityProfileService,
  CapabilityService,
  AvailabilityProfileService,
  WorkingPatternService,
  ResourceCapacityService,
} from "./services/index.js";
export type {
  CapacityProfileServiceDeps,
  CapabilityServiceDeps,
  AvailabilityProfileServiceDeps,
  WorkingPatternServiceDeps,
  ResourceCapacityServiceDeps,
} from "./services/index.js";

export {
  CapacityLifecyclePolicy,
  CapabilityAssignmentPolicy,
  AvailabilityPolicy,
  WorkingPatternPolicy,
} from "./policies/index.js";

export {
  CapacityProfileFactory,
  CapabilityFactory,
  AvailabilityProfileFactory,
  WorkingPatternFactory,
  ResourceCapacityFactory,
} from "./factories/index.js";

export {
  CapacityProfileNotFoundError,
  CapacityProfileValidationError,
  OverlappingCapacityProfileError,
  DuplicateCapabilityError,
  CapabilityNotFoundError,
  InvalidCapacityQuantityError,
  InvalidWorkingPatternError,
  InvalidAvailabilityProfileError,
  ResourceCapacityConflictError,
  ResourceCapacityNotFoundError,
  AvailabilityProfileNotFoundError,
  WorkingPatternNotFoundError,
} from "./errors/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export type {
  CapacityProfileId,
  CapabilityId,
  AvailabilityProfileId,
  WorkingPatternId,
  ResourceCapacityId,
  ResourceId,
  OrganizationId,
} from "./types/index.js";
export {
  asCapacityProfileId,
  asCapabilityId,
  asAvailabilityProfileId,
  asWorkingPatternId,
  asResourceCapacityId,
  asResourceId,
  asOrganizationId,
} from "./types/index.js";
