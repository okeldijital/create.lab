import type { OrganizationId } from "@creative-lab/organization";
import type { Shift, ShiftId, ShiftRepository } from "@creative-lab/scheduling";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { shifts } from "./schema.js";
import { ShiftMapper } from "./mappers.js";

export class PostgresShiftRepository implements ShiftRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: ShiftId): Promise<Shift | null> {
    const rows = await this.db.select().from(shifts).where(eq(shifts.id, id)).limit(1);
    return rows[0] ? ShiftMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<Shift[]> {
    const rows = await this.db.select().from(shifts).where(eq(shifts.organizationId, organizationId));
    return rows.map(ShiftMapper.fromRow);
  }

  async findAll(): Promise<Shift[]> {
    const rows = await this.db.select().from(shifts);
    return rows.map(ShiftMapper.fromRow);
  }

  async save(shift: Shift): Promise<void> {
    await this.db.insert(shifts).values(ShiftMapper.toRow(shift));
  }

  async update(shift: Shift): Promise<void> {
    await this.db.update(shifts).set(ShiftMapper.toRow(shift)).where(eq(shifts.id, shift.id));
  }

  async archive(id: ShiftId): Promise<void> {
    // Shift has no archive/status field; hard delete implements repository archive without inventing lifecycle.
    await this.db.delete(shifts).where(eq(shifts.id, id));
  }

  async exists(id: ShiftId): Promise<boolean> {
    const rows = await this.db.select({ id: shifts.id }).from(shifts).where(eq(shifts.id, id)).limit(1);
    return rows.length > 0;
  }
}
