import type { OrganizationId } from "@creative-lab/organization";
import type { WorkOrderId, WorkSession, WorkSessionId, WorkSessionRepository } from "@creative-lab/operations";
import { eq, inArray } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { workSessions } from "./schema.js";
import { WorkSessionMapper } from "./mappers.js";

export class PostgresWorkSessionRepository implements WorkSessionRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: WorkSessionId): Promise<WorkSession | null> {
    const rows = await this.db.select().from(workSessions).where(eq(workSessions.id, id)).limit(1);
    return rows[0] ? WorkSessionMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<WorkSession[]> {
    const rows = await this.db
      .select()
      .from(workSessions)
      .where(eq(workSessions.organizationId, organizationId));
    return rows.map(WorkSessionMapper.fromRow);
  }

  async findByWorkOrder(workOrderId: WorkOrderId): Promise<WorkSession[]> {
    const rows = await this.db.select().from(workSessions).where(eq(workSessions.workOrderId, workOrderId));
    return rows.map(WorkSessionMapper.fromRow);
  }

  async findActive(): Promise<WorkSession[]> {
    const rows = await this.db
      .select()
      .from(workSessions)
      .where(inArray(workSessions.status, ["ACTIVE", "PAUSED"]));
    return rows.map(WorkSessionMapper.fromRow);
  }

  async save(session: WorkSession): Promise<void> {
    await this.db.insert(workSessions).values(WorkSessionMapper.toRow(session));
  }

  async update(session: WorkSession): Promise<void> {
    await this.db
      .update(workSessions)
      .set(WorkSessionMapper.toRow(session))
      .where(eq(workSessions.id, session.id));
  }

  async archive(id: WorkSessionId): Promise<void> {
    // WorkSession has no archive status; hard delete implements repository archive without inventing lifecycle.
    await this.db.delete(workSessions).where(eq(workSessions.id, id));
  }

  async exists(id: WorkSessionId): Promise<boolean> {
    const rows = await this.db
      .select({ id: workSessions.id })
      .from(workSessions)
      .where(eq(workSessions.id, id))
      .limit(1);
    return rows.length > 0;
  }
}
