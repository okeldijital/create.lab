import type { ProjectDependency } from "../aggregates/ProjectDependency/ProjectDependency.js";
import { DependencyStatus } from "../enums/DependencyStatus.js";
import {
  DependencyCycleError,
  SelfDependencyError,
} from "../errors/ProjectErrors.js";
import type { ProjectId } from "../types/ids.js";
import { wouldCreateCycle } from "../utils/index.js";

/**
 * Self-dependency and cycle prevention for project dependency graph.
 */
export class DependencyPolicy {
  static assertNotSelf(
    projectId: ProjectId,
    dependsOnProjectId: ProjectId,
  ): void {
    if (projectId === dependsOnProjectId) {
      throw new SelfDependencyError(projectId);
    }
  }

  /**
   * Edges mean project depends on dependsOn (project → dependsOn).
   * Only ACTIVE dependencies participate in cycle detection.
   */
  static assertNoCycle(
    existing: readonly ProjectDependency[],
    projectId: ProjectId,
    dependsOnProjectId: ProjectId,
  ): void {
    DependencyPolicy.assertNotSelf(projectId, dependsOnProjectId);
    const edges = existing
      .filter((d) => d.status === DependencyStatus.ACTIVE)
      .map((d) => ({
        from: d.projectId as string,
        to: d.dependsOnProjectId as string,
      }));
    if (
      wouldCreateCycle(edges, projectId as string, dependsOnProjectId as string)
    ) {
      throw new DependencyCycleError(
        `Adding dependency ${projectId} → ${dependsOnProjectId} would create a cycle.`,
      );
    }
  }
}
