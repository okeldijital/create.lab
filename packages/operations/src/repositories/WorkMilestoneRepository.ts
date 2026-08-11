import type { OrganizationId } from "@creative-lab/organization";
import type { WorkMilestone } from "../aggregates/WorkMilestone/WorkMilestone.js";
import type { WorkMilestoneId, WorkOrderId } from "../types/ids.js";

export interface WorkMilestoneRepository {
  findById(id: WorkMilestoneId): Promise<WorkMilestone | null>;
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<WorkMilestone[]>;
  findByWorkOrder(workOrderId: WorkOrderId): Promise<WorkMilestone[]>;
  findActive(): Promise<WorkMilestone[]>;
  save(milestone: WorkMilestone): Promise<void>;
  update(milestone: WorkMilestone): Promise<void>;
  archive(id: WorkMilestoneId): Promise<void>;
  exists(id: WorkMilestoneId): Promise<boolean>;
}
