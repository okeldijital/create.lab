/**
 * @creative-lab/crm
 *
 * Customer Relationship Management bounded context — EPIC-214.
 * Owns customers, contacts, opportunities, and interaction history.
 * No email sending, auth, marketing, document storage, or external CRM sync.
 */

export {
  Customer,
  Contact,
  Opportunity,
  Interaction,
} from "./aggregates/index.js";
export type {
  CreateCustomerProps,
  CustomerSnapshot,
  CreateContactProps,
  ContactSnapshot,
  CreateOpportunityProps,
  OpportunitySnapshot,
  CreateInteractionProps,
  InteractionSnapshot,
} from "./aggregates/index.js";

export {
  CustomerNumber,
  CustomerName,
  LegalName,
  EmailAddress,
  PhoneNumber,
  OpportunityValue,
  Probability,
  InteractionSummary,
  ContactName,
  OpportunityTitle,
  Industry,
  BillingAddress,
  ContactRole,
} from "./value-objects/index.js";

export {
  CustomerStatus,
  CUSTOMER_TRANSITIONS,
  canTransitionCustomer,
  ContactStatus,
  OpportunityStatus,
  OPPORTUNITY_TRANSITIONS,
  canTransitionOpportunity,
  InteractionType,
} from "./enums/index.js";

export {
  CustomerCreated,
  CustomerActivated,
  CustomerArchived,
  ContactAdded,
  PrimaryContactChanged,
  OpportunityCreated,
  OpportunityWon,
  OpportunityLost,
  OpportunityArchived,
  InteractionRecorded,
} from "./events/index.js";

export type {
  CustomerRepository,
  ContactRepository,
  OpportunityRepository,
  InteractionRepository,
} from "./repositories/index.js";

export {
  CustomerService,
  ContactService,
  OpportunityService,
  InteractionService,
} from "./services/index.js";
export type {
  CustomerServiceDeps,
  ContactServiceDeps,
  OpportunityServiceDeps,
  InteractionServiceDeps,
} from "./services/index.js";

export {
  CustomerLifecyclePolicy,
  ContactPolicy,
  OpportunityPolicy,
  InteractionPolicy,
} from "./policies/index.js";

export {
  CustomerFactory,
  ContactFactory,
  OpportunityFactory,
  InteractionFactory,
} from "./factories/index.js";

export {
  CustomerNotFoundError,
  DuplicateCustomerNumberError,
  ContactNotFoundError,
  DuplicatePrimaryContactError,
  DuplicateContactEmailError,
  OpportunityNotFoundError,
  InvalidOpportunityStateError,
  InteractionNotFoundError,
  InvalidCustomerStateError,
  CRMValidationError,
} from "./errors/index.js";

export type {
  CustomerId,
  ContactId,
  OpportunityId,
  InteractionId,
  OrganizationId,
  ProjectId,
} from "./types/index.js";
export {
  asCustomerId,
  asContactId,
  asOpportunityId,
  asInteractionId,
  asOrganizationId,
} from "./types/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export { uniqueIds } from "./utils/index.js";
