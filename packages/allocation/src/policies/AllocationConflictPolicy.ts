import type { Allocation } from "../aggregates/Allocation/Allocation.js";
import {
  AllocationConflictError,
  DuplicateAllocationError,
} from "../errors/AllocationErrors.js";
import { rangesOverlap } from "../utils/index.js";

/**
 * Detects commitment conflicts — never computes capacity or availability math.
 */
export class AllocationConflictPolicy {
  /**
   * Rejects another active commitment of the same resource to the same work order.
   */
  static assertNoDuplicateActive(
    existing: readonly Allocation[],
    resourceId: string,
    workOrderId: string,
    excludeId?: string,
  ): void {
    const dup = existing.find(
      (a) =>
        a.id !== excludeId &&
        a.isActiveCommitment &&
        a.resourceId === resourceId &&
        a.workOrderId === workOrderId,
    );
    if (dup) {
      throw new DuplicateAllocationError(
        `Resource "${resourceId}" is already allocated to work order "${workOrderId}".`,
      );
    }
  }

  /**
   * Detects overlapping date ranges for the same resource among active commitments.
   */
  static assertNoOverlap(
    existing: readonly Allocation[],
    resourceId: string,
    start: Date,
    end: Date,
    excludeId?: string,
  ): void {
    for (const a of existing) {
      if (a.id === excludeId) continue;
      if (!a.isActiveCommitment) continue;
      if (a.resourceId !== resourceId) continue;
      if (rangesOverlap(start, end, a.startDate, a.endDate)) {
        throw new AllocationConflictError(
          `Resource "${resourceId}" has overlapping active allocation "${a.id}".`,
        );
      }
    }
  }

  static detectConflicts(input: {
    existing: readonly Allocation[];
    resourceId: string;
    workOrderId: string;
    start: Date;
    end: Date;
    excludeId?: string;
  }): void {
    AllocationConflictPolicy.assertNoDuplicateActive(
      input.existing,
      input.resourceId,
      input.workOrderId,
      input.excludeId,
    );
    AllocationConflictPolicy.assertNoOverlap(
      input.existing,
      input.resourceId,
      input.start,
      input.end,
      input.excludeId,
    );
  }
}
