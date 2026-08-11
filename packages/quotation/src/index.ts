/**
 * @creative-lab/quotation
 *
 * Quotation Management bounded context — EPIC-216.
 * Owns commercial proposals, versions, lines, and customer approvals.
 * No projects, invoices, tax, payments, PDF, or email.
 */

export {
  Quote,
  QuoteVersion,
  QuoteLine,
  QuoteApproval,
} from "./aggregates/index.js";
export type {
  CreateQuoteProps,
  QuoteSnapshot,
  CreateQuoteVersionProps,
  QuoteVersionSnapshot,
  CreateQuoteLineProps,
  QuoteLineSnapshot,
  CreateQuoteApprovalProps,
  QuoteApprovalSnapshot,
} from "./aggregates/index.js";

export {
  QuoteNumber,
  QuoteDescription,
  QuoteNotes,
  Quantity,
  Currency,
  Money,
  Discount,
  ValidityPeriod,
} from "./value-objects/index.js";

export {
  QuoteStatus,
  QUOTE_TRANSITIONS,
  canTransitionQuote,
  QuoteVersionStatus,
  ApprovalStatus,
} from "./enums/index.js";

export {
  QuoteCreated,
  QuoteIssued,
  QuoteAccepted,
  QuoteDeclined,
  QuoteExpired,
  QuoteArchived,
  QuoteVersionCreated,
  QuoteVersionPromoted,
  QuoteLineAdded,
  QuoteLineRemoved,
  QuoteApprovalRecorded,
} from "./events/index.js";

export type {
  QuoteRepository,
  QuoteVersionRepository,
  QuoteLineRepository,
  QuoteApprovalRepository,
} from "./repositories/index.js";

export {
  QuoteService,
  VersionService,
  LineService,
  ApprovalService,
} from "./services/index.js";
export type {
  QuoteServiceDeps,
  VersionServiceDeps,
  LineServiceDeps,
  AddLineProps,
  ApprovalServiceDeps,
} from "./services/index.js";

export {
  PricingPolicy,
  QuoteLifecyclePolicy,
  VersionPolicy,
  ApprovalPolicy,
} from "./policies/index.js";
export type {
  LinePricingInput,
  LinePricingResult,
  VersionTotals,
} from "./policies/index.js";

export {
  QuoteFactory,
  QuoteVersionFactory,
  QuoteLineFactory,
  QuoteApprovalFactory,
} from "./factories/index.js";

export {
  QuoteNotFoundError,
  DuplicateQuoteNumberError,
  QuoteVersionNotFoundError,
  QuoteAlreadyIssuedError,
  QuoteAlreadyAcceptedError,
  QuoteExpiredError,
  QuoteApprovalError,
  QuoteLineNotFoundError,
  InvalidQuoteStateError,
  QuotationValidationError,
} from "./errors/index.js";

export type {
  QuoteId,
  QuoteVersionId,
  QuoteLineId,
  QuoteApprovalId,
  OrganizationId,
  CustomerId,
  OpportunityId,
  ServiceId,
} from "./types/index.js";
export {
  asQuoteId,
  asQuoteVersionId,
  asQuoteLineId,
  asQuoteApprovalId,
  asOrganizationId,
} from "./types/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export { uniqueIds } from "./utils/index.js";
