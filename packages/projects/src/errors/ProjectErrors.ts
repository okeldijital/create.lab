import { DomainError } from "@creative-lab/core";

export class ProjectNotFoundError extends DomainError {
  readonly code = "PROJECT_NOT_FOUND";
  constructor(identifier: string) {
    super(`Project not found: ${identifier}`);
  }
}

export class DuplicateProjectError extends DomainError {
  readonly code = "DUPLICATE_PROJECT";
  constructor(name: string, organizationId: string) {
    super(
      `Project name "${name}" already exists in organization "${organizationId}".`,
    );
  }
}

export class InvalidProjectStateError extends DomainError {
  readonly code = "INVALID_PROJECT_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class PhaseSequenceError extends DomainError {
  readonly code = "PHASE_SEQUENCE_ERROR";
  constructor(message: string) {
    super(message);
  }
}

export class DuplicateDeliverableError extends DomainError {
  readonly code = "DUPLICATE_DELIVERABLE";
  constructor(name: string, projectId: string) {
    super(
      `Deliverable "${name}" already exists on project "${projectId}".`,
    );
  }
}

export class DependencyCycleError extends DomainError {
  readonly code = "DEPENDENCY_CYCLE";
  constructor(message: string) {
    super(message);
  }
}

export class SelfDependencyError extends DomainError {
  readonly code = "SELF_DEPENDENCY";
  constructor(projectId: string) {
    super(`Project "${projectId}" cannot depend on itself.`);
  }
}

export class ObjectiveAlreadyCompletedError extends DomainError {
  readonly code = "OBJECTIVE_ALREADY_COMPLETED";
  constructor(name: string) {
    super(`Objective "${name}" is already completed and immutable.`);
  }
}

export class ProjectPhaseNotFoundError extends DomainError {
  readonly code = "PROJECT_PHASE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Project phase not found: ${identifier}`);
  }
}

export class DeliverableNotFoundError extends DomainError {
  readonly code = "DELIVERABLE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Deliverable not found: ${identifier}`);
  }
}

export class ProjectDependencyNotFoundError extends DomainError {
  readonly code = "PROJECT_DEPENDENCY_NOT_FOUND";
  constructor(identifier: string) {
    super(`Project dependency not found: ${identifier}`);
  }
}

export class ProjectObjectiveNotFoundError extends DomainError {
  readonly code = "PROJECT_OBJECTIVE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Project objective not found: ${identifier}`);
  }
}

export class DuplicatePhaseError extends DomainError {
  readonly code = "DUPLICATE_PHASE";
  constructor(message: string) {
    super(message);
  }
}

export class DuplicateObjectiveError extends DomainError {
  readonly code = "DUPLICATE_OBJECTIVE";
  constructor(name: string, projectId: string) {
    super(
      `Objective "${name}" already exists on project "${projectId}".`,
    );
  }
}

export class ProjectValidationError extends DomainError {
  readonly code = "PROJECT_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}
