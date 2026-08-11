import type { OrganizationId } from "@creative-lab/organization";
import type { WorkIncident } from "../aggregates/WorkIncident/WorkIncident.js";
import type { WorkIncidentId, WorkOrderId } from "../types/ids.js";

export interface WorkIncidentRepository {
  findById(id: WorkIncidentId): Promise<WorkIncident | null>;
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<WorkIncident[]>;
  findByWorkOrder(workOrderId: WorkOrderId): Promise<WorkIncident[]>;
  findActive(): Promise<WorkIncident[]>;
  save(incident: WorkIncident): Promise<void>;
  update(incident: WorkIncident): Promise<void>;
  archive(id: WorkIncidentId): Promise<void>;
  exists(id: WorkIncidentId): Promise<boolean>;
}
