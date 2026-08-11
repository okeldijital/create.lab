import type { OrganizationId } from "@creative-lab/organization";
import type { WorkOutput } from "../aggregates/WorkOutput/WorkOutput.js";
import type { WorkOrderId, WorkOutputId } from "../types/ids.js";

export interface WorkOutputRepository {
  findById(id: WorkOutputId): Promise<WorkOutput | null>;
  findByOrganization(organizationId: OrganizationId): Promise<WorkOutput[]>;
  findByWorkOrder(workOrderId: WorkOrderId): Promise<WorkOutput[]>;
  findActive(): Promise<WorkOutput[]>;
  save(output: WorkOutput): Promise<void>;
  update(output: WorkOutput): Promise<void>;
  archive(id: WorkOutputId): Promise<void>;
  exists(id: WorkOutputId): Promise<boolean>;
}
