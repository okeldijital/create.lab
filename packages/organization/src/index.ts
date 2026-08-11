/**
 * @creative-lab/organization
 *
 * Organization bounded context — EPIC-201.
 * Pure domain model: aggregates, value objects, events, policies, services,
 * and repository ports. No persistence, Payload, API, or UI.
 */

// Aggregates
export {
  Organization,
  Department,
  Team,
  Studio,
  OrganizationSettings,
} from "./aggregates/index.js";
export type {
  CreateOrganizationProps,
  OrganizationSnapshot,
  CreateDepartmentProps,
  DepartmentSnapshot,
  CreateTeamProps,
  TeamSnapshot,
  CreateStudioProps,
  StudioSnapshot,
  CreateOrganizationSettingsProps,
  OrganizationSettingsSnapshot,
} from "./aggregates/index.js";

// Value objects
export {
  OrganizationName,
  OrganizationSlug,
  DepartmentName,
  TeamName,
  StudioName,
  Timezone,
  Locale,
  Currency,
  WorkingWeek,
  Weekday,
  WorkingHours,
} from "./value-objects/index.js";

// Enums
export {
  OrganizationStatus,
  ORGANIZATION_STATUS_TRANSITIONS,
  canTransitionOrganizationStatus,
  DepartmentStatus,
  TeamStatus,
  StudioStatus,
  StudioType,
} from "./enums/index.js";

// Events
export {
  DomainEvent,
  DOMAIN_EVENT_VERSION,
  OrganizationCreated,
  OrganizationUpdated,
  OrganizationArchived,
  DepartmentCreated,
  DepartmentUpdated,
  DepartmentArchived,
  TeamCreated,
  TeamUpdated,
  TeamArchived,
  StudioCreated,
  StudioUpdated,
  StudioArchived,
  OrganizationSettingsUpdated,
} from "./events/index.js";
export type { AnyDomainEvent, DomainEventProps } from "./events/index.js";

// Repository ports
export type {
  OrganizationRepository,
  DepartmentRepository,
  TeamRepository,
  StudioRepository,
  OrganizationSettingsRepository,
} from "./repositories/index.js";

// Services
export {
  OrganizationService,
  DepartmentService,
  TeamService,
  StudioService,
  OrganizationSettingsService,
} from "./services/index.js";
export type {
  OrganizationServiceDeps,
  DepartmentServiceDeps,
  TeamServiceDeps,
  StudioServiceDeps,
  OrganizationSettingsServiceDeps,
} from "./services/index.js";

// Policies
export {
  DepartmentHierarchyPolicy,
  OrganizationActivationPolicy,
  StudioAvailabilityPolicy,
} from "./policies/index.js";
export type { DepartmentHierarchyNode } from "./policies/index.js";

// Factories
export {
  OrganizationFactory,
  DepartmentFactory,
  TeamFactory,
  StudioFactory,
  OrganizationSettingsFactory,
} from "./factories/index.js";

// Errors
export {
  DomainError,
  OrganizationNotFoundError,
  OrganizationArchivedError,
  DuplicateOrganizationSlugError,
  InvalidOrganizationStatusTransitionError,
  OrganizationValidationError,
  DepartmentNotFoundError,
  DuplicateDepartmentError,
  DepartmentHierarchyError,
  DepartmentValidationError,
  TeamNotFoundError,
  DuplicateTeamError,
  TeamValidationError,
  StudioNotFoundError,
  DuplicateStudioError,
  InvalidStudioCapacityError,
  StudioValidationError,
  OrganizationSettingsNotFoundError,
  OrganizationSettingsValidationError,
} from "./errors/index.js";

// Interfaces
export type { DomainEventPublisher } from "./interfaces/index.js";

// Types
export type {
  OrganizationId,
  DepartmentId,
  TeamId,
  StudioId,
  EventId,
  BrandingMetadata,
  PoliciesMetadata,
} from "./types/index.js";
export {
  asOrganizationId,
  asDepartmentId,
  asTeamId,
  asStudioId,
  asEventId,
} from "./types/index.js";
