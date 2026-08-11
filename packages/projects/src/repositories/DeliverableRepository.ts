import type { OrganizationId } from "@creative-lab/organization";
import type { Deliverable } from "../aggregates/Deliverable/Deliverable.js";
import type { DeliverableId, ProjectId } from "../types/ids.js";

export interface DeliverableRepository {
  findById(id: DeliverableId): Promise<Deliverable | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Deliverable[]>;
  findByProject(projectId: ProjectId): Promise<Deliverable[]>;
  findActive(): Promise<Deliverable[]>;
  save(deliverable: Deliverable): Promise<void>;
  update(deliverable: Deliverable): Promise<void>;
  archive(id: DeliverableId): Promise<void>;
  exists(id: DeliverableId): Promise<boolean>;
}
