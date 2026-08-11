/**
 * @creative-lab/billing
 *
 * Billing & Invoicing bounded context — EPIC-213.
 * Owns what is owed, invoiced, and paid — commercial lifecycle after delivery.
 * No payment gateway, banking, PDF, email, or ERP.
 */

export {
  Invoice,
  InvoiceLine,
  Payment,
  CreditNote,
} from "./aggregates/index.js";
export type {
  CreateInvoiceProps,
  InvoiceSnapshot,
  CreateInvoiceLineProps,
  InvoiceLineSnapshot,
  CreatePaymentProps,
  PaymentSnapshot,
  CreateCreditNoteProps,
  CreditNoteSnapshot,
} from "./aggregates/index.js";

export {
  Currency,
  Money,
  InvoiceNumber,
  PaymentReference,
  CreditReference,
  InvoiceDescription,
  BillingReason,
} from "./value-objects/index.js";

export {
  InvoiceStatus,
  INVOICE_TRANSITIONS,
  canTransitionInvoice,
  PaymentStatus,
  PaymentMethod,
  CreditStatus,
} from "./enums/index.js";

export {
  InvoiceCreated,
  InvoiceIssued,
  InvoicePaid,
  InvoicePartiallyPaid,
  InvoiceVoided,
  InvoiceArchived,
  PaymentRecorded,
  PaymentCompleted,
  PaymentRefunded,
  CreditNoteCreated,
  CreditNoteIssued,
  CreditNoteApplied,
  CreditNoteArchived,
} from "./events/index.js";

export type {
  InvoiceRepository,
  InvoiceLineRepository,
  PaymentRepository,
  CreditNoteRepository,
} from "./repositories/index.js";

export {
  InvoiceService,
  InvoiceLineService,
  PaymentService,
  CreditNoteService,
} from "./services/index.js";
export type {
  InvoiceServiceDeps,
  InvoiceLineServiceDeps,
  PaymentServiceDeps,
  RecordPaymentProps,
  CreditNoteServiceDeps,
} from "./services/index.js";

export {
  InvoiceLifecyclePolicy,
  InvoiceCalculationPolicy,
  PaymentPolicy,
  CreditPolicy,
} from "./policies/index.js";
export type {
  LineInput,
  LineTotals,
  InvoiceTotals,
} from "./policies/index.js";

export {
  InvoiceFactory,
  InvoiceLineFactory,
  PaymentFactory,
  CreditNoteFactory,
} from "./factories/index.js";

export {
  InvoiceNotFoundError,
  InvoiceAlreadyIssuedError,
  InvoiceAlreadyPaidError,
  InvoiceAlreadyVoidedError,
  PaymentNotFoundError,
  PaymentExceedsBalanceError,
  CreditNoteNotFoundError,
  CreditLimitExceededError,
  InvalidInvoiceStateError,
  BillingValidationError,
  InvoiceLineNotFoundError,
} from "./errors/index.js";

export type {
  InvoiceId,
  InvoiceLineId,
  PaymentId,
  CreditNoteId,
  OrganizationId,
  ProjectId,
  DeliveryId,
} from "./types/index.js";
export {
  asInvoiceId,
  asInvoiceLineId,
  asPaymentId,
  asCreditNoteId,
  asOrganizationId,
} from "./types/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export { uniqueIds } from "./utils/index.js";
