import type { Project } from "../aggregates/Project/Project.js";
import {
  ProjectStatus,
  canTransitionProject,
} from "../enums/ProjectStatus.js";
import {
  DuplicateProjectError,
  InvalidProjectStateError,
} from "../errors/ProjectErrors.js";
import type { OrganizationId } from "@creative-lab/organization";
import { ProjectName } from "../value-objects/ProjectName.js";

/**
 * Project status transitions and org-scoped name uniqueness.
 */
export class ProjectLifecyclePolicy {
  static assertCanTransition(project: Project, to: ProjectStatus): void {
    if (project.isClosed) {
      throw new InvalidProjectStateError(
        "Closed projects are immutable and cannot be transitioned.",
      );
    }
    if (!canTransitionProject(project.status, to)) {
      throw new InvalidProjectStateError(
        `Illegal project transition: ${project.status} → ${to}.`,
      );
    }
  }

  static assertMutable(project: Project): void {
    if (project.isClosed) {
      throw new InvalidProjectStateError("Closed projects are immutable.");
    }
  }

  static assertAcceptsChildActivity(project: Project): void {
    if (
      project.status === ProjectStatus.CLOSED ||
      project.status === ProjectStatus.CANCELLED ||
      project.status === ProjectStatus.COMPLETED
    ) {
      throw new InvalidProjectStateError(
        `Project in status ${project.status} cannot accept new child activity.`,
      );
    }
  }

  static assertUniqueName(
    existing: readonly Project[],
    name: string,
    organizationId: OrganizationId,
    excludeId?: string,
  ): void {
    const candidate = ProjectName.create(name);
    const dup = existing.find(
      (p) =>
        p.id !== excludeId &&
        p.organizationId === organizationId &&
        p.name.equalsIgnoreCase(candidate),
    );
    if (dup) {
      throw new DuplicateProjectError(candidate.value, organizationId);
    }
  }
}
