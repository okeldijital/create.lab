import { DomainError } from "@creative-lab/core";

export class QuoteNotFoundError extends DomainError {
  readonly code = "QUOTE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Quote not found: ${identifier}`);
  }
}

export class DuplicateQuoteNumberError extends DomainError {
  readonly code = "DUPLICATE_QUOTE_NUMBER";
  constructor(quoteNumber: string, organizationId: string) {
    super(
      `Quote number "${quoteNumber}" already exists in organization "${organizationId}".`,
    );
  }
}

export class QuoteVersionNotFoundError extends DomainError {
  readonly code = "QUOTE_VERSION_NOT_FOUND";
  constructor(identifier: string) {
    super(`Quote version not found: ${identifier}`);
  }
}

export class QuoteAlreadyIssuedError extends DomainError {
  readonly code = "QUOTE_ALREADY_ISSUED";
  constructor(quoteId: string) {
    super(`Quote "${quoteId}" is already issued.`);
  }
}

export class QuoteAlreadyAcceptedError extends DomainError {
  readonly code = "QUOTE_ALREADY_ACCEPTED";
  constructor(quoteId: string) {
    super(`Quote "${quoteId}" is already accepted.`);
  }
}

export class QuoteExpiredError extends DomainError {
  readonly code = "QUOTE_EXPIRED";
  constructor(quoteId: string) {
    super(`Quote "${quoteId}" has expired.`);
  }
}

export class QuoteApprovalError extends DomainError {
  readonly code = "QUOTE_APPROVAL_ERROR";
  constructor(message: string) {
    super(message);
  }
}

export class QuoteLineNotFoundError extends DomainError {
  readonly code = "QUOTE_LINE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Quote line not found: ${identifier}`);
  }
}

export class InvalidQuoteStateError extends DomainError {
  readonly code = "INVALID_QUOTE_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class QuotationValidationError extends DomainError {
  readonly code = "QUOTATION_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}
