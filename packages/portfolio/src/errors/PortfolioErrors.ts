import { DomainError } from "@creative-lab/core";

export class PortfolioNotFoundError extends DomainError {
  readonly code = "PORTFOLIO_NOT_FOUND";
  constructor(identifier: string) {
    super(`Portfolio not found: ${identifier}`);
  }
}

export class DuplicatePortfolioNumberError extends DomainError {
  readonly code = "DUPLICATE_PORTFOLIO_NUMBER";
  constructor(portfolioNumber: string, organizationId: string) {
    super(
      `Portfolio number "${portfolioNumber}" already exists in organization "${organizationId}".`,
    );
  }
}

export class ProgramNotFoundError extends DomainError {
  readonly code = "PROGRAM_NOT_FOUND";
  constructor(identifier: string) {
    super(`Program not found: ${identifier}`);
  }
}

export class InitiativeNotFoundError extends DomainError {
  readonly code = "INITIATIVE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Initiative not found: ${identifier}`);
  }
}

export class PortfolioMilestoneNotFoundError extends DomainError {
  readonly code = "PORTFOLIO_MILESTONE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Portfolio milestone not found: ${identifier}`);
  }
}

export class InvalidPortfolioStateError extends DomainError {
  readonly code = "INVALID_PORTFOLIO_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class DuplicateInitiativeTitleError extends DomainError {
  readonly code = "DUPLICATE_INITIATIVE_TITLE";
  constructor(title: string, portfolioId: string) {
    super(
      `Initiative title "${title}" already exists in portfolio "${portfolioId}".`,
    );
  }
}

export class ProgramSequenceError extends DomainError {
  readonly code = "PROGRAM_SEQUENCE_ERROR";
  constructor(message: string) {
    super(message);
  }
}

export class PortfolioValidationError extends DomainError {
  readonly code = "PORTFOLIO_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}
