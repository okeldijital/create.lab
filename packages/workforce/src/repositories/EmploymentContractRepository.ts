import type { OrganizationId } from "@creative-lab/organization";
import type { EmploymentContract } from "../aggregates/EmploymentContract/EmploymentContract.js";
import type { EmploymentContractId, EmploymentId } from "../types/ids.js";

export interface EmploymentContractRepository {
  findById(id: EmploymentContractId): Promise<EmploymentContract | null>;
  findAll(): Promise<EmploymentContract[]>;
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<EmploymentContract[]>;
  findByEmployment(employmentId: EmploymentId): Promise<EmploymentContract[]>;
  findActiveByEmployment(
    employmentId: EmploymentId,
  ): Promise<EmploymentContract | null>;
  save(contract: EmploymentContract): Promise<void>;
  update(contract: EmploymentContract): Promise<void>;
  archive(id: EmploymentContractId): Promise<void>;
  exists(id: EmploymentContractId): Promise<boolean>;
  delete(id: EmploymentContractId): Promise<void>;
}
