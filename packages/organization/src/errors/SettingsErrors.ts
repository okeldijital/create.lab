import { DomainError } from "@creative-lab/core";

export class OrganizationSettingsNotFoundError extends DomainError {
  readonly code = "ORGANIZATION_SETTINGS_NOT_FOUND";

  constructor(organizationId: string) {
    super(`Organization settings not found for organization: ${organizationId}`);
  }
}

export class OrganizationSettingsValidationError extends DomainError {
  readonly code = "ORGANIZATION_SETTINGS_VALIDATION";

  constructor(message: string) {
    super(message);
  }
}
