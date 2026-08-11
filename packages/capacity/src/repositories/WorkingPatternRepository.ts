import type { OrganizationId } from "@creative-lab/organization";
import type { WorkingPattern } from "../aggregates/WorkingPattern/WorkingPattern.js";
import type { WorkingPatternId } from "../types/ids.js";

export interface WorkingPatternRepository {
  findById(id: WorkingPatternId): Promise<WorkingPattern | null>;
  findByOrganization(organizationId: OrganizationId): Promise<WorkingPattern[]>;
  findAll(): Promise<WorkingPattern[]>;
  save(pattern: WorkingPattern): Promise<void>;
  update(pattern: WorkingPattern): Promise<void>;
  archive(id: WorkingPatternId): Promise<void>;
  exists(id: WorkingPatternId): Promise<boolean>;
}
