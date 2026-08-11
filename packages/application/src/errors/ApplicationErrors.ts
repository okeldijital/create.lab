/**
 * Application-layer errors — distinct from DomainError.
 * Used for validation, auth, orchestration, and boundary failures.
 */
export abstract class ApplicationError extends Error {
  abstract readonly code: string;
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message);
    this.name = new.target.name;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends ApplicationError {
  readonly code = "APPLICATION_VALIDATION";
  readonly fieldErrors: ReadonlyArray<{ field: string; message: string }>;

  constructor(
    message: string,
    fieldErrors: ReadonlyArray<{ field: string; message: string }> = [],
  ) {
    super(message, { fieldErrors });
    this.fieldErrors = fieldErrors;
  }
}

export class AuthorizationError extends ApplicationError {
  readonly code = "APPLICATION_AUTHORIZATION";
  constructor(message = "Not authorized to perform this action.") {
    super(message);
  }
}

export class NotFoundError extends ApplicationError {
  readonly code = "APPLICATION_NOT_FOUND";
  constructor(resource: string, identifier?: string) {
    super(
      identifier
        ? `${resource} not found: ${identifier}`
        : `${resource} not found`,
      { resource, identifier },
    );
  }
}

export class ConflictError extends ApplicationError {
  readonly code = "APPLICATION_CONFLICT";
  constructor(message: string) {
    super(message);
  }
}

export class ConcurrencyError extends ApplicationError {
  readonly code = "APPLICATION_CONCURRENCY";
  constructor(message = "Concurrent modification detected.") {
    super(message);
  }
}

export class TransactionError extends ApplicationError {
  readonly code = "APPLICATION_TRANSACTION";
  constructor(message: string) {
    super(message);
  }
}

export class HandlerNotFoundError extends ApplicationError {
  readonly code = "APPLICATION_HANDLER_NOT_FOUND";
  constructor(commandOrQueryType: string) {
    super(`No handler registered for: ${commandOrQueryType}`, {
      type: commandOrQueryType,
    });
  }
}
