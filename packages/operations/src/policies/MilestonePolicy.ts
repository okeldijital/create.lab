import type { WorkMilestone } from "../aggregates/WorkMilestone/WorkMilestone.js";
import { DuplicateMilestoneError } from "../errors/OperationsErrors.js";
import type { WorkOrderId } from "../types/ids.js";
import { MilestoneName } from "../value-objects/MilestoneName.js";

/**
 * Milestone uniqueness and completion invariants.
 */
export class MilestonePolicy {
  static assertUniqueName(
    existing: readonly WorkMilestone[],
    name: string,
    workOrderId: WorkOrderId,
    excludeId?: string,
  ): void {
    const candidate = MilestoneName.create(name);
    const dup = existing.find(
      (m) =>
        m.id !== excludeId &&
        m.workOrderId === workOrderId &&
        m.name.equals(candidate),
    );
    if (dup) {
      throw new DuplicateMilestoneError(candidate.value, workOrderId);
    }
  }
}
