import type { ContractId } from "@creative-lab/contracts";
import type { CustomerId } from "@creative-lab/crm";
import type { OrganizationId } from "@creative-lab/organization";
import type { ProjectId } from "@creative-lab/projects";
import type { Engagement } from "../aggregates/Engagement/Engagement.js";
import type { EngagementStatus } from "../enums/EngagementStatus.js";
import type { EngagementId } from "../types/ids.js";

export interface EngagementRepository {
  findById(id: EngagementId): Promise<Engagement | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Engagement[]>;
  findByCustomer(customerId: CustomerId): Promise<Engagement[]>;
  findByContract(contractId: ContractId): Promise<Engagement[]>;
  findByProject(projectId: ProjectId): Promise<Engagement[]>;
  findByStatus(status: EngagementStatus): Promise<Engagement[]>;
  findByEngagementNumber(
    organizationId: OrganizationId,
    engagementNumber: string,
  ): Promise<Engagement | null>;
  save(engagement: Engagement): Promise<void>;
  update(engagement: Engagement): Promise<void>;
  archive(id: EngagementId): Promise<void>;
  exists(id: EngagementId): Promise<boolean>;
}
