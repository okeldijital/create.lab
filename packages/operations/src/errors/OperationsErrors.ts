import { DomainError } from "@creative-lab/core";

export class WorkOrderNotFoundError extends DomainError {
  readonly code = "WORK_ORDER_NOT_FOUND";
  constructor(identifier: string) {
    super(`Work order not found: ${identifier}`);
  }
}

export class InvalidWorkStateError extends DomainError {
  readonly code = "INVALID_WORK_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class SessionOverlapError extends DomainError {
  readonly code = "SESSION_OVERLAP";
  constructor(message: string) {
    super(message);
  }
}

export class MilestoneAlreadyCompletedError extends DomainError {
  readonly code = "MILESTONE_ALREADY_COMPLETED";
  constructor(name: string) {
    super(`Milestone "${name}" is already completed and immutable.`);
  }
}

export class DuplicateMilestoneError extends DomainError {
  readonly code = "DUPLICATE_MILESTONE";
  constructor(name: string, workOrderId: string) {
    super(
      `Milestone "${name}" already exists on work order "${workOrderId}".`,
    );
  }
}

export class OutputVersionConflictError extends DomainError {
  readonly code = "OUTPUT_VERSION_CONFLICT";
  constructor(message: string) {
    super(message);
  }
}

export class IncidentAlreadyResolvedError extends DomainError {
  readonly code = "INCIDENT_ALREADY_RESOLVED";
  constructor(incidentId: string) {
    super(`Incident "${incidentId}" is already resolved.`);
  }
}

export class InvalidIncidentStateError extends DomainError {
  readonly code = "INVALID_INCIDENT_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class WorkSessionNotFoundError extends DomainError {
  readonly code = "WORK_SESSION_NOT_FOUND";
  constructor(identifier: string) {
    super(`Work session not found: ${identifier}`);
  }
}

export class WorkMilestoneNotFoundError extends DomainError {
  readonly code = "WORK_MILESTONE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Work milestone not found: ${identifier}`);
  }
}

export class WorkOutputNotFoundError extends DomainError {
  readonly code = "WORK_OUTPUT_NOT_FOUND";
  constructor(identifier: string) {
    super(`Work output not found: ${identifier}`);
  }
}

export class WorkIncidentNotFoundError extends DomainError {
  readonly code = "WORK_INCIDENT_NOT_FOUND";
  constructor(identifier: string) {
    super(`Work incident not found: ${identifier}`);
  }
}

export class OperationsValidationError extends DomainError {
  readonly code = "OPERATIONS_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}
