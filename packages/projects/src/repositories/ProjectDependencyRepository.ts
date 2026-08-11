import type { OrganizationId } from "@creative-lab/organization";
import type { ProjectDependency } from "../aggregates/ProjectDependency/ProjectDependency.js";
import type { ProjectDependencyId, ProjectId } from "../types/ids.js";

export interface ProjectDependencyRepository {
  findById(id: ProjectDependencyId): Promise<ProjectDependency | null>;
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<ProjectDependency[]>;
  findByProject(projectId: ProjectId): Promise<ProjectDependency[]>;
  /** Dependencies where this project is the target (others depend on it). */
  findDependingOn(projectId: ProjectId): Promise<ProjectDependency[]>;
  findActive(): Promise<ProjectDependency[]>;
  save(dependency: ProjectDependency): Promise<void>;
  update(dependency: ProjectDependency): Promise<void>;
  archive(id: ProjectDependencyId): Promise<void>;
  exists(id: ProjectDependencyId): Promise<boolean>;
}
