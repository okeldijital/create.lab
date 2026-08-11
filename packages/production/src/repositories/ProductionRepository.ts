import type { OrganizationId } from "@creative-lab/organization";
import type { WorkOrderId } from "@creative-lab/operations";
import type { ProjectId } from "@creative-lab/projects";
import type { Production } from "../aggregates/Production/Production.js";
import type { ProductionId } from "../types/ids.js";

export interface ProductionRepository {
  findById(id: ProductionId): Promise<Production | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Production[]>;
  findByProject(projectId: ProjectId): Promise<Production[]>;
  findByWorkOrder(workOrderId: WorkOrderId): Promise<Production[]>;
  findByOwner(ownerId: string): Promise<Production[]>;
  findActive(): Promise<Production[]>;
  save(production: Production): Promise<void>;
  update(production: Production): Promise<void>;
  archive(id: ProductionId): Promise<void>;
  exists(id: ProductionId): Promise<boolean>;
}
