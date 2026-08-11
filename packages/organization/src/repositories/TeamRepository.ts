import type { Team } from "../aggregates/Team/Team.js";
import type { DepartmentId, OrganizationId, TeamId } from "../types/ids.js";

export interface TeamRepository {
  findById(id: TeamId): Promise<Team | null>;
  findByOrganizationId(organizationId: OrganizationId): Promise<Team[]>;
  findByDepartmentId(departmentId: DepartmentId): Promise<Team[]>;
  findByNameInDepartment(
    departmentId: DepartmentId,
    name: string,
  ): Promise<Team | null>;
  findAll(): Promise<Team[]>;
  save(team: Team): Promise<void>;
  update(team: Team): Promise<void>;
  archive(id: TeamId): Promise<void>;
  exists(id: TeamId): Promise<boolean>;
  existsByNameInDepartment(
    departmentId: DepartmentId,
    name: string,
  ): Promise<boolean>;
  delete(id: TeamId): Promise<void>;
}
