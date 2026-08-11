import type { Department } from "../aggregates/Department/Department.js";
import { DepartmentHierarchyError } from "../errors/DepartmentErrors.js";
import type { DepartmentId, OrganizationId } from "../types/ids.js";

export type DepartmentHierarchyNode = {
  id: DepartmentId;
  organizationId: OrganizationId;
  parentDepartmentId: DepartmentId | null;
};

/**
 * Cross-aggregate policy: department hierarchy integrity within an organization.
 */
export class DepartmentHierarchyPolicy {
  /**
   * Ensure parent belongs to the same organization and would not create a cycle.
   */
  static assertValidParent(input: {
    departmentId: DepartmentId;
    organizationId: OrganizationId;
    parentDepartmentId: DepartmentId | null;
    departments: readonly DepartmentHierarchyNode[];
  }): void {
    const { departmentId, organizationId, parentDepartmentId, departments } =
      input;

    if (parentDepartmentId === null) {
      return;
    }

    if (parentDepartmentId === departmentId) {
      throw new DepartmentHierarchyError(
        "Department cannot be its own parent.",
      );
    }

    const byId = new Map(departments.map((d) => [d.id, d]));
    const parent = byId.get(parentDepartmentId);
    if (!parent) {
      throw new DepartmentHierarchyError(
        `Parent department "${parentDepartmentId}" was not found.`,
      );
    }
    if (parent.organizationId !== organizationId) {
      throw new DepartmentHierarchyError(
        "Parent department must belong to the same organization.",
      );
    }

    // Walk ancestors of parent; if we meet departmentId, cycle would form.
    const visited = new Set<DepartmentId>();
    let current: DepartmentId | null = parentDepartmentId;
    while (current) {
      if (current === departmentId) {
        throw new DepartmentHierarchyError(
          "Circular department hierarchy is prohibited.",
        );
      }
      if (visited.has(current)) {
        throw new DepartmentHierarchyError(
          "Existing circular hierarchy detected in department tree.",
        );
      }
      visited.add(current);
      const node = byId.get(current);
      current = node?.parentDepartmentId ?? null;
    }
  }

  static assertWithinDepth(input: {
    departmentId: DepartmentId;
    parentDepartmentId: DepartmentId | null;
    departments: readonly DepartmentHierarchyNode[];
    maxDepth: number;
  }): void {
    if (input.parentDepartmentId === null) {
      return;
    }
    const byId = new Map(input.departments.map((d) => [d.id, d]));
    let depth = 1;
    let current: DepartmentId | null = input.parentDepartmentId;
    const visited = new Set<DepartmentId>();
    while (current) {
      if (visited.has(current)) {
        throw new DepartmentHierarchyError(
          "Existing circular hierarchy detected in department tree.",
        );
      }
      visited.add(current);
      depth += 1;
      if (depth > input.maxDepth) {
        throw new DepartmentHierarchyError(
          `Department hierarchy exceeds maximum depth of ${input.maxDepth}.`,
        );
      }
      const node = byId.get(current);
      current = node?.parentDepartmentId ?? null;
    }
  }

  static fromDepartments(
    departments: readonly Department[],
  ): DepartmentHierarchyNode[] {
    return departments.map((d) => ({
      id: d.id,
      organizationId: d.organizationId,
      parentDepartmentId: d.parentDepartmentId,
    }));
  }
}
