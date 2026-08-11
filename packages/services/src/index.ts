/**
 * @creative-lab/services
 *
 * Services & Pricing bounded context — EPIC-215.
 * Owns commercial service catalogue and standard pricing rules.
 * No quotes, invoices, tax, payments, or project execution.
 */

export {
  Service,
  ServiceCategory,
  PriceBook,
  PriceRule,
} from "./aggregates/index.js";
export type {
  CreateServiceProps,
  ServiceSnapshot,
  CreateServiceCategoryProps,
  ServiceCategorySnapshot,
  CreatePriceBookProps,
  PriceBookSnapshot,
  CreatePriceRuleProps,
  PriceRuleSnapshot,
} from "./aggregates/index.js";

export {
  ServiceCode,
  ServiceName,
  CategoryName,
  PriceBookName,
  ServiceDescription,
  Currency,
  Money,
  PriceRange,
} from "./value-objects/index.js";

export {
  ServiceStatus,
  SERVICE_TRANSITIONS,
  canTransitionService,
  CategoryStatus,
  PriceBookStatus,
  PRICE_BOOK_TRANSITIONS,
  canTransitionPriceBook,
  PricingModel,
  PriceRuleStatus,
} from "./enums/index.js";

export {
  ServiceCreated,
  ServiceActivated,
  ServiceArchived,
  CategoryCreated,
  CategoryArchived,
  PriceBookCreated,
  PriceBookPublished,
  PriceBookRetired,
  PriceRuleCreated,
  PriceRuleUpdated,
  PriceRuleArchived,
} from "./events/index.js";

export type {
  ServiceRepository,
  CategoryRepository,
  PriceBookRepository,
  PriceRuleRepository,
} from "./repositories/index.js";

export {
  ServiceService,
  CategoryService,
  PriceBookService,
  PriceRuleService,
} from "./services/index.js";
export type {
  ServiceServiceDeps,
  CategoryServiceDeps,
  PriceBookServiceDeps,
  PriceRuleServiceDeps,
} from "./services/index.js";

export {
  ServiceLifecyclePolicy,
  CategoryPolicy,
  PriceBookPolicy,
  PriceRulePolicy,
} from "./policies/index.js";

export {
  ServiceFactory,
  ServiceCategoryFactory,
  PriceBookFactory,
  PriceRuleFactory,
} from "./factories/index.js";

export {
  ServiceNotFoundError,
  DuplicateServiceCodeError,
  CategoryNotFoundError,
  CategoryInUseError,
  DuplicateCategoryNameError,
  PriceBookNotFoundError,
  PublishedPriceBookExistsError,
  PriceRuleNotFoundError,
  InvalidPriceRangeError,
  DuplicatePriceRuleError,
  InvalidServiceStateError,
  ServicesValidationError,
} from "./errors/index.js";

export type {
  ServiceId,
  ServiceCategoryId,
  PriceBookId,
  PriceRuleId,
  OrganizationId,
} from "./types/index.js";
export {
  asServiceId,
  asServiceCategoryId,
  asPriceBookId,
  asPriceRuleId,
  asOrganizationId,
} from "./types/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export { uniqueIds } from "./utils/index.js";
