import { DomainError } from "@creative-lab/core";

export class WorkerNotFoundError extends DomainError {
  readonly code = "WORKER_NOT_FOUND";
  constructor(identifier: string) {
    super(`Worker not found: ${identifier}`);
  }
}

export class DuplicateEmailError extends DomainError {
  readonly code = "DUPLICATE_WORKER_EMAIL";
  constructor(email: string, organizationId: string) {
    super(
      `Email "${email}" is already used in organization "${organizationId}".`,
    );
  }
}

export class DuplicateEmployeeNumberError extends DomainError {
  readonly code = "DUPLICATE_EMPLOYEE_NUMBER";
  constructor(employeeNumber: string, organizationId: string) {
    super(
      `Employee number "${employeeNumber}" already exists in organization "${organizationId}".`,
    );
  }
}

export class WorkerArchivedError extends DomainError {
  readonly code = "WORKER_ARCHIVED";
  constructor(workerId: string) {
    super(`Worker "${workerId}" is archived and cannot be modified.`);
  }
}

export class WorkerValidationError extends DomainError {
  readonly code = "WORKER_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidEmploymentPeriodError extends DomainError {
  readonly code = "INVALID_EMPLOYMENT_PERIOD";
  constructor(message: string) {
    super(message);
  }
}

export class EmploymentConflictError extends DomainError {
  readonly code = "EMPLOYMENT_CONFLICT";
  constructor(message: string) {
    super(message);
  }
}

export class EmploymentNotFoundError extends DomainError {
  readonly code = "EMPLOYMENT_NOT_FOUND";
  constructor(identifier: string) {
    super(`Employment not found: ${identifier}`);
  }
}

export class ContractConflictError extends DomainError {
  readonly code = "CONTRACT_CONFLICT";
  constructor(message: string) {
    super(message);
  }
}

export class ContractNotFoundError extends DomainError {
  readonly code = "CONTRACT_NOT_FOUND";
  constructor(identifier: string) {
    super(`Employment contract not found: ${identifier}`);
  }
}

export class ReportingHierarchyError extends DomainError {
  readonly code = "REPORTING_HIERARCHY";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidManagerAssignmentError extends DomainError {
  readonly code = "INVALID_MANAGER_ASSIGNMENT";
  constructor(message: string) {
    super(message);
  }
}

export class PositionNotFoundError extends DomainError {
  readonly code = "POSITION_NOT_FOUND";
  constructor(identifier: string) {
    super(`Position not found: ${identifier}`);
  }
}

export class DuplicatePositionError extends DomainError {
  readonly code = "DUPLICATE_POSITION";
  constructor(title: string, organizationId: string) {
    super(
      `Position title "${title}" already exists in organization "${organizationId}".`,
    );
  }
}

export class PositionValidationError extends DomainError {
  readonly code = "POSITION_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidWorkerStatusTransitionError extends DomainError {
  readonly code = "INVALID_WORKER_STATUS_TRANSITION";
  constructor(from: string, to: string) {
    super(`Invalid worker status transition: ${from} → ${to}`);
  }
}
