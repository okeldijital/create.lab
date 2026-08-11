import type {
  DepartmentId,
  OrganizationId,
} from "@creative-lab/organization";
import type { Department, Organization, Team } from "@creative-lab/organization";
import {
  InvalidManagerAssignmentError,
  WorkerValidationError,
} from "../errors/WorkforceErrors.js";
import type { WorkerId } from "../types/ids.js";
import type { Worker } from "../aggregates/Worker/Worker.js";

/**
 * Validates organizational assignments for workers (department/team/manager org scope).
 */
export class WorkerAssignmentPolicy {
  static assertDepartmentInOrganization(
    department: Department,
    organizationId: OrganizationId,
  ): void {
    if (department.organizationId !== organizationId) {
      throw new WorkerValidationError(
        "Department must belong to the worker's organization.",
      );
    }
  }

  static assertTeamInOrganization(
    team: Team,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
  ): void {
    if (team.organizationId !== organizationId) {
      throw new WorkerValidationError(
        "Team must belong to the worker's organization.",
      );
    }
    if (team.departmentId !== departmentId) {
      throw new WorkerValidationError(
        "Team must belong to the worker's department.",
      );
    }
  }

  static assertManagerInOrganization(
    manager: Worker,
    organizationId: OrganizationId,
    workerId: WorkerId,
  ): void {
    if (manager.id === workerId) {
      throw new InvalidManagerAssignmentError(
        "Manager cannot equal worker.",
      );
    }
    if (manager.organizationId !== organizationId) {
      throw new InvalidManagerAssignmentError(
        "Manager must belong to the same organization.",
      );
    }
    if (manager.isArchived) {
      throw new InvalidManagerAssignmentError(
        "Manager cannot be an archived worker.",
      );
    }
  }

  static assertOrganizationActive(organization: Organization): void {
    if (organization.isArchived) {
      throw new WorkerValidationError(
        "Cannot modify workforce for an archived organization.",
      );
    }
  }
}
