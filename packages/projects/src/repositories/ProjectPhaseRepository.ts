import type { OrganizationId } from "@creative-lab/organization";
import type { ProjectPhase } from "../aggregates/ProjectPhase/ProjectPhase.js";
import type { ProjectId, ProjectPhaseId } from "../types/ids.js";

export interface ProjectPhaseRepository {
  findById(id: ProjectPhaseId): Promise<ProjectPhase | null>;
  findByOrganization(organizationId: OrganizationId): Promise<ProjectPhase[]>;
  findByProject(projectId: ProjectId): Promise<ProjectPhase[]>;
  findActive(): Promise<ProjectPhase[]>;
  save(phase: ProjectPhase): Promise<void>;
  update(phase: ProjectPhase): Promise<void>;
  archive(id: ProjectPhaseId): Promise<void>;
  exists(id: ProjectPhaseId): Promise<boolean>;
}
