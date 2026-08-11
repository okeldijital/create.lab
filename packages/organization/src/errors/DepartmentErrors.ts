import { DomainError } from "@creative-lab/core";

export class DepartmentNotFoundError extends DomainError {
  readonly code = "DEPARTMENT_NOT_FOUND";

  constructor(identifier: string) {
    super(`Department not found: ${identifier}`);
  }
}

export class DuplicateDepartmentError extends DomainError {
  readonly code = "DUPLICATE_DEPARTMENT";

  constructor(name: string, organizationId: string) {
    super(
      `Department name "${name}" already exists in organization "${organizationId}".`,
    );
  }
}

export class DepartmentHierarchyError extends DomainError {
  readonly code = "DEPARTMENT_HIERARCHY";

  constructor(message: string) {
    super(message);
  }
}

export class DepartmentValidationError extends DomainError {
  readonly code = "DEPARTMENT_VALIDATION";

  constructor(message: string) {
    super(message);
  }
}
