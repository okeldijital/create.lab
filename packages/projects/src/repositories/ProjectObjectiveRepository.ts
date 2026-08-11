import type { OrganizationId } from "@creative-lab/organization";
import type { ProjectObjective } from "../aggregates/ProjectObjective/ProjectObjective.js";
import type { ProjectId, ProjectObjectiveId } from "../types/ids.js";

export interface ProjectObjectiveRepository {
  findById(id: ProjectObjectiveId): Promise<ProjectObjective | null>;
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<ProjectObjective[]>;
  findByProject(projectId: ProjectId): Promise<ProjectObjective[]>;
  findActive(): Promise<ProjectObjective[]>;
  save(objective: ProjectObjective): Promise<void>;
  update(objective: ProjectObjective): Promise<void>;
  archive(id: ProjectObjectiveId): Promise<void>;
  exists(id: ProjectObjectiveId): Promise<boolean>;
}
