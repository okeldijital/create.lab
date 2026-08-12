import type { OrganizationId } from "@creative-lab/organization";
import type {
  WorkIncident,
  WorkIncidentId,
  WorkIncidentRepository,
  WorkOrderId,
} from "@creative-lab/operations";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { workIncidents } from "./schema.js";
import { WorkIncidentMapper } from "./mappers.js";

export class PostgresWorkIncidentRepository implements WorkIncidentRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: WorkIncidentId): Promise<WorkIncident | null> {
    const rows = await this.db.select().from(workIncidents).where(eq(workIncidents.id, id)).limit(1);
    return rows[0] ? WorkIncidentMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<WorkIncident[]> {
    const rows = await this.db
      .select()
      .from(workIncidents)
      .where(eq(workIncidents.organizationId, organizationId));
    return rows.map(WorkIncidentMapper.fromRow);
  }

  async findByWorkOrder(workOrderId: WorkOrderId): Promise<WorkIncident[]> {
    const rows = await this.db.select().from(workIncidents).where(eq(workIncidents.workOrderId, workOrderId));
    return rows.map(WorkIncidentMapper.fromRow);
  }

  async findActive(): Promise<WorkIncident[]> {
    const rows = await this.db.select().from(workIncidents).where(eq(workIncidents.resolved, false));
    return rows.map(WorkIncidentMapper.fromRow);
  }

  async save(incident: WorkIncident): Promise<void> {
    await this.db.insert(workIncidents).values(WorkIncidentMapper.toRow(incident));
  }

  async update(incident: WorkIncident): Promise<void> {
    await this.db
      .update(workIncidents)
      .set(WorkIncidentMapper.toRow(incident))
      .where(eq(workIncidents.id, incident.id));
  }

  async archive(id: WorkIncidentId): Promise<void> {
    // WorkIncident has no archive status; hard delete implements repository archive without inventing lifecycle.
    await this.db.delete(workIncidents).where(eq(workIncidents.id, id));
  }

  async exists(id: WorkIncidentId): Promise<boolean> {
    const rows = await this.db
      .select({ id: workIncidents.id })
      .from(workIncidents)
      .where(eq(workIncidents.id, id))
      .limit(1);
    return rows.length > 0;
  }
}
