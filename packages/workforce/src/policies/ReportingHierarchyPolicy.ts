import type { OrganizationId } from "@creative-lab/organization";
import {
  InvalidManagerAssignmentError,
  ReportingHierarchyError,
} from "../errors/WorkforceErrors.js";
import type { WorkerId } from "../types/ids.js";

export type ReportingNode = {
  workerId: WorkerId;
  managerId: WorkerId | null;
  organizationId: OrganizationId;
};

/**
 * Prevents self-management and circular reporting chains within an organization.
 */
export class ReportingHierarchyPolicy {
  static assertValidAssignment(input: {
    workerId: WorkerId;
    managerId: WorkerId;
    organizationId: OrganizationId;
    /** Current manager map for workers in the organization (active edges). */
    nodes: readonly ReportingNode[];
  }): void {
    const { workerId, managerId, organizationId, nodes } = input;

    if (workerId === managerId) {
      throw new InvalidManagerAssignmentError(
        "Manager cannot equal worker.",
      );
    }

    const byWorker = new Map(nodes.map((n) => [n.workerId, n]));
    const managerNode = byWorker.get(managerId);
    if (managerNode && managerNode.organizationId !== organizationId) {
      throw new InvalidManagerAssignmentError(
        "Manager must belong to the same organization.",
      );
    }

    // Walk managers starting from proposed manager; if we reach worker → cycle.
    const visited = new Set<WorkerId>();
    let current: WorkerId | null = managerId;
    while (current) {
      if (current === workerId) {
        throw new ReportingHierarchyError(
          "Circular reporting relationship is prohibited.",
        );
      }
      if (visited.has(current)) {
        throw new ReportingHierarchyError(
          "Existing circular reporting hierarchy detected.",
        );
      }
      visited.add(current);
      const node = byWorker.get(current);
      // Apply provisional edge: if looking at worker's current node, use proposed manager
      if (current === managerId) {
        // continue from manager's existing manager
        current = node?.managerId ?? null;
      } else {
        current = node?.managerId ?? null;
      }
    }
  }

  static fromManagerMap(
    entries: ReadonlyArray<{
      workerId: WorkerId;
      managerId: WorkerId | null;
      organizationId: OrganizationId;
    }>,
  ): ReportingNode[] {
    return entries.map((e) => ({
      workerId: e.workerId,
      managerId: e.managerId,
      organizationId: e.organizationId,
    }));
  }
}
