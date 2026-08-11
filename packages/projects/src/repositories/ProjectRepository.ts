import type { OrganizationId } from "@creative-lab/organization";
import type { Project } from "../aggregates/Project/Project.js";
import type { ProjectId } from "../types/ids.js";

export interface ProjectRepository {
  findById(id: ProjectId): Promise<Project | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Project[]>;
  findByOwner(ownerId: string): Promise<Project[]>;
  findActive(): Promise<Project[]>;
  save(project: Project): Promise<void>;
  update(project: Project): Promise<void>;
  archive(id: ProjectId): Promise<void>;
  exists(id: ProjectId): Promise<boolean>;
}
