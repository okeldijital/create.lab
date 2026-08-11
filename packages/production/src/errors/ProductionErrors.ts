import { DomainError } from "@creative-lab/core";

export class ProductionNotFoundError extends DomainError {
  readonly code = "PRODUCTION_NOT_FOUND";
  constructor(identifier: string) {
    super(`Production not found: ${identifier}`);
  }
}

export class DuplicateProductionError extends DomainError {
  readonly code = "DUPLICATE_PRODUCTION";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidProductionStateError extends DomainError {
  readonly code = "INVALID_PRODUCTION_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class SessionAlreadyOpenError extends DomainError {
  readonly code = "SESSION_ALREADY_OPEN";
  constructor(productionId: string) {
    super(
      `Production "${productionId}" already has an open session.`,
    );
  }
}

export class SessionNotOpenError extends DomainError {
  readonly code = "SESSION_NOT_OPEN";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidSessionError extends DomainError {
  readonly code = "INVALID_SESSION";
  constructor(message: string) {
    super(message);
  }
}

export class MilestoneSequenceError extends DomainError {
  readonly code = "MILESTONE_SEQUENCE_ERROR";
  constructor(message: string) {
    super(message);
  }
}

export class DuplicateMilestoneError extends DomainError {
  readonly code = "DUPLICATE_MILESTONE";
  constructor(message: string) {
    super(message);
  }
}

export class RevisionLifecycleError extends DomainError {
  readonly code = "REVISION_LIFECYCLE";
  constructor(message: string) {
    super(message);
  }
}

export class DuplicateRevisionError extends DomainError {
  readonly code = "DUPLICATE_REVISION";
  constructor(message: string) {
    super(message);
  }
}

export class SessionNotFoundError extends DomainError {
  readonly code = "SESSION_NOT_FOUND";
  constructor(identifier: string) {
    super(`Production session not found: ${identifier}`);
  }
}

export class MilestoneNotFoundError extends DomainError {
  readonly code = "MILESTONE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Production milestone not found: ${identifier}`);
  }
}

export class RevisionNotFoundError extends DomainError {
  readonly code = "REVISION_NOT_FOUND";
  constructor(identifier: string) {
    super(`Revision not found: ${identifier}`);
  }
}

export class ProductionValidationError extends DomainError {
  readonly code = "PRODUCTION_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}
