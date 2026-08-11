import type { OrganizationId } from "@creative-lab/organization";
import type { WorkOrderId } from "@creative-lab/operations";
import type { ProjectId } from "@creative-lab/projects";
import type { Allocation } from "../aggregates/Allocation/Allocation.js";
import type { AllocationId } from "../types/ids.js";

export interface AllocationRepository {
  findById(id: AllocationId): Promise<Allocation | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Allocation[]>;
  findByProject(projectId: ProjectId): Promise<Allocation[]>;
  findByWorkOrder(workOrderId: WorkOrderId): Promise<Allocation[]>;
  findByResource(resourceId: string): Promise<Allocation[]>;
  findActive(): Promise<Allocation[]>;
  save(allocation: Allocation): Promise<void>;
  update(allocation: Allocation): Promise<void>;
  archive(id: AllocationId): Promise<void>;
  exists(id: AllocationId): Promise<boolean>;
}
