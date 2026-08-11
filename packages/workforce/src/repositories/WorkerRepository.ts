import type { OrganizationId } from "@creative-lab/organization";
import type { Worker } from "../aggregates/Worker/Worker.js";
import type { WorkerId } from "../types/ids.js";

export interface WorkerRepository {
  findById(id: WorkerId): Promise<Worker | null>;
  findAll(): Promise<Worker[]>;
  findByOrganization(organizationId: OrganizationId): Promise<Worker[]>;
  findByEmail(
    organizationId: OrganizationId,
    email: string,
  ): Promise<Worker | null>;
  findByEmployeeNumber(
    organizationId: OrganizationId,
    employeeNumber: string,
  ): Promise<Worker | null>;
  save(worker: Worker): Promise<void>;
  update(worker: Worker): Promise<void>;
  archive(id: WorkerId): Promise<void>;
  exists(id: WorkerId): Promise<boolean>;
  existsByEmail(organizationId: OrganizationId, email: string): Promise<boolean>;
  existsByEmployeeNumber(
    organizationId: OrganizationId,
    employeeNumber: string,
  ): Promise<boolean>;
  delete(id: WorkerId): Promise<void>;
}
