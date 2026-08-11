import { DomainError } from "@creative-lab/core";

export class InvoiceNotFoundError extends DomainError {
  readonly code = "INVOICE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Invoice not found: ${identifier}`);
  }
}

export class InvoiceAlreadyIssuedError extends DomainError {
  readonly code = "INVOICE_ALREADY_ISSUED";
  constructor(invoiceId: string) {
    super(`Invoice "${invoiceId}" is already issued.`);
  }
}

export class InvoiceAlreadyPaidError extends DomainError {
  readonly code = "INVOICE_ALREADY_PAID";
  constructor(invoiceId: string) {
    super(`Invoice "${invoiceId}" is already paid.`);
  }
}

export class InvoiceAlreadyVoidedError extends DomainError {
  readonly code = "INVOICE_ALREADY_VOIDED";
  constructor(invoiceId: string) {
    super(`Invoice "${invoiceId}" is already voided.`);
  }
}

export class PaymentNotFoundError extends DomainError {
  readonly code = "PAYMENT_NOT_FOUND";
  constructor(identifier: string) {
    super(`Payment not found: ${identifier}`);
  }
}

export class PaymentExceedsBalanceError extends DomainError {
  readonly code = "PAYMENT_EXCEEDS_BALANCE";
  constructor(message: string) {
    super(message);
  }
}

export class CreditNoteNotFoundError extends DomainError {
  readonly code = "CREDIT_NOTE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Credit note not found: ${identifier}`);
  }
}

export class CreditLimitExceededError extends DomainError {
  readonly code = "CREDIT_LIMIT_EXCEEDED";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidInvoiceStateError extends DomainError {
  readonly code = "INVALID_INVOICE_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class BillingValidationError extends DomainError {
  readonly code = "BILLING_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}

export class InvoiceLineNotFoundError extends DomainError {
  readonly code = "INVOICE_LINE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Invoice line not found: ${identifier}`);
  }
}
