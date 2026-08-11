import { DomainError } from "@creative-lab/core";

export class AllocationNotFoundError extends DomainError {
  readonly code = "ALLOCATION_NOT_FOUND";
  constructor(identifier: string) {
    super(`Allocation not found: ${identifier}`);
  }
}

export class DuplicateAllocationError extends DomainError {
  readonly code = "DUPLICATE_ALLOCATION";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidAllocationStateError extends DomainError {
  readonly code = "INVALID_ALLOCATION_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class AllocationConflictError extends DomainError {
  readonly code = "ALLOCATION_CONFLICT";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidAllocationPercentageError extends DomainError {
  readonly code = "INVALID_ALLOCATION_PERCENTAGE";
  constructor(message: string) {
    super(message);
  }
}

export class ReservationNotFoundError extends DomainError {
  readonly code = "RESERVATION_NOT_FOUND";
  constructor(identifier: string) {
    super(`Reservation not found: ${identifier}`);
  }
}

export class ReservationLifecycleError extends DomainError {
  readonly code = "RESERVATION_LIFECYCLE";
  constructor(message: string) {
    super(message);
  }
}

export class AllocationGroupNotFoundError extends DomainError {
  readonly code = "ALLOCATION_GROUP_NOT_FOUND";
  constructor(identifier: string) {
    super(`Allocation group not found: ${identifier}`);
  }
}

export class DuplicateAllocationGroupError extends DomainError {
  readonly code = "DUPLICATE_ALLOCATION_GROUP";
  constructor(name: string, organizationId: string) {
    super(
      `Allocation group "${name}" already exists in organization "${organizationId}".`,
    );
  }
}

export class AllocationValidationError extends DomainError {
  readonly code = "ALLOCATION_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}
