export class InfrastructureError extends Error {
  readonly code: string;

  constructor(message: string, code = "INFRASTRUCTURE_ERROR") {
    super(message);
    this.name = "InfrastructureError";
    this.code = code;
  }
}

export class TransactionError extends InfrastructureError {
  constructor(message: string) {
    super(message, "TRANSACTION_ERROR");
    this.name = "TransactionError";
  }
}

export class RepositoryError extends InfrastructureError {
  constructor(message: string) {
    super(message, "REPOSITORY_ERROR");
    this.name = "RepositoryError";
  }
}

export class EventDispatchError extends InfrastructureError {
  constructor(message: string) {
    super(message, "EVENT_DISPATCH_ERROR");
    this.name = "EventDispatchError";
  }
}

export class AuthorizationAdapterError extends InfrastructureError {
  constructor(message: string) {
    super(message, "AUTHORIZATION_ADAPTER_ERROR");
    this.name = "AuthorizationAdapterError";
  }
}
