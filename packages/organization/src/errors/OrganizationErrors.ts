import { DomainError } from "@creative-lab/core";
import type { OrganizationStatus } from "../enums/OrganizationStatus.js";

export class OrganizationNotFoundError extends DomainError {
  readonly code = "ORGANIZATION_NOT_FOUND";

  constructor(identifier: string) {
    super(`Organization not found: ${identifier}`);
  }
}

export class OrganizationArchivedError extends DomainError {
  readonly code = "ORGANIZATION_ARCHIVED";

  constructor(organizationId: string) {
    super(
      `Organization "${organizationId}" is archived and cannot be modified.`,
    );
  }
}

export class DuplicateOrganizationSlugError extends DomainError {
  readonly code = "DUPLICATE_ORGANIZATION_SLUG";

  constructor(slug: string) {
    super(`Organization slug already exists: ${slug}`);
  }
}

export class InvalidOrganizationStatusTransitionError extends DomainError {
  readonly code = "INVALID_ORGANIZATION_STATUS_TRANSITION";

  constructor(from: OrganizationStatus, to: OrganizationStatus) {
    super(`Invalid organization status transition: ${from} → ${to}`);
  }
}

export class OrganizationValidationError extends DomainError {
  readonly code = "ORGANIZATION_VALIDATION";

  constructor(message: string) {
    super(message);
  }
}
