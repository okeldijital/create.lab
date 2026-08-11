import type { WorkOutput } from "../aggregates/WorkOutput/WorkOutput.js";
import { OutputVersionConflictError } from "../errors/OperationsErrors.js";
import { OutputVersion } from "../value-objects/OutputVersion.js";

/**
 * Output versioning rules (metadata only; no file storage).
 */
export class OutputPolicy {
  /**
   * Next version for a given output name on a work order is max(existing)+1,
   * or 1 if none.
   */
  static nextVersion(
    existingForName: readonly WorkOutput[],
  ): OutputVersion {
    if (existingForName.length === 0) {
      return OutputVersion.first();
    }
    const max = Math.max(...existingForName.map((o) => o.version.value));
    return OutputVersion.create(max + 1);
  }

  static assertVersionAvailable(
    existingForName: readonly WorkOutput[],
    version: number,
  ): void {
    const conflict = existingForName.find((o) => o.version.value === version);
    if (conflict) {
      throw new OutputVersionConflictError(
        `Output version ${version} already exists for name "${conflict.name.value}".`,
      );
    }
    OutputVersion.create(version);
  }

  static filterByName(
    outputs: readonly WorkOutput[],
    name: string,
  ): WorkOutput[] {
    const normalized = name.trim().toLowerCase();
    return outputs.filter(
      (o) => o.name.value.trim().toLowerCase() === normalized,
    );
  }
}
