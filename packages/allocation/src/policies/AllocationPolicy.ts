import type { Allocation } from "../aggregates/Allocation/Allocation.js";
import { InvalidAllocationStateError } from "../errors/AllocationErrors.js";
import { AllocationPercentage } from "../value-objects/AllocationPercentage.js";

/**
 * Single-allocation invariants: percentage, date ordering, archive immutability.
 */
export class AllocationPolicy {
  static assertPercentage(value: number): void {
    AllocationPercentage.create(value);
  }

  static assertDateOrder(start: Date, end: Date): void {
    if (end.getTime() <= start.getTime()) {
      throw new InvalidAllocationStateError(
        "Allocation endDate must be after startDate.",
      );
    }
  }

  static assertMutable(allocation: Allocation): void {
    if (allocation.isArchived) {
      throw new InvalidAllocationStateError(
        "Archived allocations are immutable.",
      );
    }
  }
}
