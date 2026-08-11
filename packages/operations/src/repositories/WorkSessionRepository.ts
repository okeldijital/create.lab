import type { OrganizationId } from "@creative-lab/organization";
import type { WorkSession } from "../aggregates/WorkSession/WorkSession.js";
import type { WorkOrderId, WorkSessionId } from "../types/ids.js";

export interface WorkSessionRepository {
  findById(id: WorkSessionId): Promise<WorkSession | null>;
  findByOrganization(organizationId: OrganizationId): Promise<WorkSession[]>;
  findByWorkOrder(workOrderId: WorkOrderId): Promise<WorkSession[]>;
  findActive(): Promise<WorkSession[]>;
  save(session: WorkSession): Promise<void>;
  update(session: WorkSession): Promise<void>;
  archive(id: WorkSessionId): Promise<void>;
  exists(id: WorkSessionId): Promise<boolean>;
}
