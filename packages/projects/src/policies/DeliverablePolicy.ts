import type { Deliverable } from "../aggregates/Deliverable/Deliverable.js";
import { DuplicateDeliverableError } from "../errors/ProjectErrors.js";
import type { ProjectId } from "../types/ids.js";
import { DeliverableName } from "../value-objects/DeliverableName.js";

/**
 * Deliverable uniqueness and completion invariants.
 */
export class DeliverablePolicy {
  static assertUniqueName(
    existing: readonly Deliverable[],
    name: string,
    projectId: ProjectId,
    excludeId?: string,
  ): void {
    const candidate = DeliverableName.create(name);
    const dup = existing.find(
      (d) =>
        d.id !== excludeId &&
        d.projectId === projectId &&
        d.name.equalsIgnoreCase(candidate),
    );
    if (dup) {
      throw new DuplicateDeliverableError(candidate.value, projectId);
    }
  }
}
