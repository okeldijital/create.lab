import type { OrganizationId } from "@creative-lab/organization";
import type { Employment } from "../aggregates/Employment/Employment.js";
import type { EmploymentId, WorkerId } from "../types/ids.js";

export interface EmploymentRepository {
  findById(id: EmploymentId): Promise<Employment | null>;
  findAll(): Promise<Employment[]>;
  findByOrganization(organizationId: OrganizationId): Promise<Employment[]>;
  findByWorker(workerId: WorkerId): Promise<Employment[]>;
  findActiveByWorker(workerId: WorkerId): Promise<Employment | null>;
  save(employment: Employment): Promise<void>;
  update(employment: Employment): Promise<void>;
  archive(id: EmploymentId): Promise<void>;
  exists(id: EmploymentId): Promise<boolean>;
  delete(id: EmploymentId): Promise<void>;
}
