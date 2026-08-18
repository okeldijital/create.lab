import type { OrganizationId } from "@creative-lab/organization";
import type { Deliverable, DeliverableId, DeliverableRepository, ProjectId } from "@creative-lab/projects";
import { eq, ne } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { deliverables } from "./schema.js";
import { DeliverableMapper } from "./mappers.js";

export class PostgresDeliverableRepository implements DeliverableRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: DeliverableId): Promise<Deliverable | null> {
    const rows = await this.db.select().from(deliverables).where(eq(deliverables.id, id)).limit(1);
    return rows[0] ? DeliverableMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<Deliverable[]> {
    const rows = await this.db.select().from(deliverables).where(eq(deliverables.organizationId, organizationId));
    return rows.map(DeliverableMapper.fromRow);
  }

  async findByProject(projectId: ProjectId): Promise<Deliverable[]> {
    const rows = await this.db.select().from(deliverables).where(eq(deliverables.projectId, projectId));
    return rows.map(DeliverableMapper.fromRow);
  }

  async findActive(): Promise<Deliverable[]> {
    const rows = await this.db.select().from(deliverables).where(ne(deliverables.status, "DELIVERED"));
    return rows.map(DeliverableMapper.fromRow);
  }

  async save(deliverable: Deliverable): Promise<void> {
    await this.db.insert(deliverables).values(DeliverableMapper.toRow(deliverable));
  }

  async update(deliverable: Deliverable): Promise<void> {
    await this.db
      .update(deliverables)
      .set(DeliverableMapper.toRow(deliverable))
      .where(eq(deliverables.id, deliverable.id));
  }

  async archive(id: DeliverableId): Promise<void> {
    // Deliverable has no archive status; hard delete implements repository archive without inventing lifecycle.
    await this.db.delete(deliverables).where(eq(deliverables.id, id));
  }

  async exists(id: DeliverableId): Promise<boolean> {
    const rows = await this.db.select({ id: deliverables.id }).from(deliverables).where(eq(deliverables.id, id)).limit(1);
    return rows.length > 0;
  }
}
