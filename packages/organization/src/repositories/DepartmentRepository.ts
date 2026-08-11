import type { Department } from "../aggregates/Department/Department.js";
import type { DepartmentId, OrganizationId } from "../types/ids.js";

export interface DepartmentRepository {
  findById(id: DepartmentId): Promise<Department | null>;
  findByOrganizationId(organizationId: OrganizationId): Promise<Department[]>;
  findByNameInOrganization(
    organizationId: OrganizationId,
    name: string,
  ): Promise<Department | null>;
  findAll(): Promise<Department[]>;
  save(department: Department): Promise<void>;
  update(department: Department): Promise<void>;
  archive(id: DepartmentId): Promise<void>;
  exists(id: DepartmentId): Promise<boolean>;
  existsByNameInOrganization(
    organizationId: OrganizationId,
    name: string,
  ): Promise<boolean>;
  delete(id: DepartmentId): Promise<void>;
}
