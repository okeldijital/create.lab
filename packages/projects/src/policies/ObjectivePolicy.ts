import type { ProjectObjective } from "../aggregates/ProjectObjective/ProjectObjective.js";
import {
  DuplicateObjectiveError,
  ObjectiveAlreadyCompletedError,
} from "../errors/ProjectErrors.js";
import type { ProjectId } from "../types/ids.js";
import { ObjectiveName } from "../value-objects/ObjectiveName.js";
import { ObjectiveProgress } from "../value-objects/ObjectiveProgress.js";

/**
 * Objective uniqueness, progress bounds, and completion immutability.
 */
export class ObjectivePolicy {
  static assertUniqueName(
    existing: readonly ProjectObjective[],
    name: string,
    projectId: ProjectId,
    excludeId?: string,
  ): void {
    const candidate = ObjectiveName.create(name);
    const dup = existing.find(
      (o) =>
        o.id !== excludeId &&
        o.projectId === projectId &&
        o.name.equalsIgnoreCase(candidate),
    );
    if (dup) {
      throw new DuplicateObjectiveError(candidate.value, projectId);
    }
  }

  static assertProgressInRange(progressPercent: number): void {
    ObjectiveProgress.create(progressPercent);
  }

  static assertMutable(objective: ProjectObjective): void {
    if (objective.isTerminal) {
      throw new ObjectiveAlreadyCompletedError(objective.name.value);
    }
  }
}
