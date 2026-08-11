import type { OrganizationId } from "@creative-lab/organization";
import type { Shift } from "../aggregates/Shift/Shift.js";
import type { ShiftId } from "../types/ids.js";

export interface ShiftRepository {
  findById(id: ShiftId): Promise<Shift | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Shift[]>;
  findAll(): Promise<Shift[]>;
  save(shift: Shift): Promise<void>;
  update(shift: Shift): Promise<void>;
  archive(id: ShiftId): Promise<void>;
  exists(id: ShiftId): Promise<boolean>;
}
