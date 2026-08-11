import { DomainError } from "@creative-lab/core";

export class StudioNotFoundError extends DomainError {
  readonly code = "STUDIO_NOT_FOUND";

  constructor(identifier: string) {
    super(`Studio not found: ${identifier}`);
  }
}

export class DuplicateStudioError extends DomainError {
  readonly code = "DUPLICATE_STUDIO";

  constructor(name: string, organizationId: string) {
    super(
      `Studio name "${name}" already exists in organization "${organizationId}".`,
    );
  }
}

export class InvalidStudioCapacityError extends DomainError {
  readonly code = "INVALID_STUDIO_CAPACITY";

  constructor(capacity: number) {
    super(`Studio capacity cannot be negative (received ${capacity}).`);
  }
}

export class StudioValidationError extends DomainError {
  readonly code = "STUDIO_VALIDATION";

  constructor(message: string) {
    super(message);
  }
}
