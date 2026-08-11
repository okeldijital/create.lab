import type { Organization } from "../aggregates/Organization/Organization.js";
import {
  OrganizationStatus,
  canTransitionOrganizationStatus,
} from "../enums/OrganizationStatus.js";
import {
  InvalidOrganizationStatusTransitionError,
  OrganizationArchivedError,
  OrganizationValidationError,
} from "../errors/OrganizationErrors.js";

/**
 * Policy for organization activation / deactivation / suspension transitions.
 */
export class OrganizationActivationPolicy {
  static assertCanActivate(organization: Organization): void {
    if (organization.isArchived) {
      throw new OrganizationArchivedError(organization.id);
    }
    if (
      !canTransitionOrganizationStatus(
        organization.status,
        OrganizationStatus.ACTIVE,
      )
    ) {
      throw new InvalidOrganizationStatusTransitionError(
        organization.status,
        OrganizationStatus.ACTIVE,
      );
    }
  }

  static assertCanSuspend(organization: Organization): void {
    if (organization.isArchived) {
      throw new OrganizationArchivedError(organization.id);
    }
    if (
      !canTransitionOrganizationStatus(
        organization.status,
        OrganizationStatus.SUSPENDED,
      )
    ) {
      throw new InvalidOrganizationStatusTransitionError(
        organization.status,
        OrganizationStatus.SUSPENDED,
      );
    }
  }

  static assertCanDeactivate(organization: Organization): void {
    if (organization.isArchived) {
      throw new OrganizationArchivedError(organization.id);
    }
    if (
      !canTransitionOrganizationStatus(
        organization.status,
        OrganizationStatus.INACTIVE,
      )
    ) {
      throw new InvalidOrganizationStatusTransitionError(
        organization.status,
        OrganizationStatus.INACTIVE,
      );
    }
  }

  static assertOperational(organization: Organization): void {
    if (organization.isArchived) {
      throw new OrganizationArchivedError(organization.id);
    }
    if (organization.status !== OrganizationStatus.ACTIVE) {
      throw new OrganizationValidationError(
        `Organization must be ACTIVE to perform this operation (current: ${organization.status}).`,
      );
    }
  }

  static isOperational(organization: Organization): boolean {
    return organization.status === OrganizationStatus.ACTIVE;
  }
}
