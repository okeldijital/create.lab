import type { OrganizationId } from "@creative-lab/organization";
import type { WorkOrderId, WorkOutput, WorkOutputId, WorkOutputRepository } from "@creative-lab/operations";
import { eq, ne } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { workOutputs } from "./schema.js";
import { WorkOutputMapper } from "./mappers.js";

export class PostgresWorkOutputRepository implements WorkOutputRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: WorkOutputId): Promise<WorkOutput | null> {
    const rows = await this.db.select().from(workOutputs).where(eq(workOutputs.id, id)).limit(1);
    return rows[0] ? WorkOutputMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<WorkOutput[]> {
    const rows = await this.db.select().from(workOutputs).where(eq(workOutputs.organizationId, organizationId));
    return rows.map(WorkOutputMapper.fromRow);
  }

  async findByWorkOrder(workOrderId: WorkOrderId): Promise<WorkOutput[]> {
    const rows = await this.db.select().from(workOutputs).where(eq(workOutputs.workOrderId, workOrderId));
    return rows.map(WorkOutputMapper.fromRow);
  }

  async findActive(): Promise<WorkOutput[]> {
    const rows = await this.db.select().from(workOutputs).where(ne(workOutputs.status, "ARCHIVED"));
    return rows.map(WorkOutputMapper.fromRow);
  }

  async save(output: WorkOutput): Promise<void> {
    await this.db.insert(workOutputs).values(WorkOutputMapper.toRow(output));
  }

  async update(output: WorkOutput): Promise<void> {
    await this.db.update(workOutputs).set(WorkOutputMapper.toRow(output)).where(eq(workOutputs.id, output.id));
  }

  async archive(id: WorkOutputId): Promise<void> {
    // WorkOutput domain has explicit ARCHIVED status.
    const now = new Date();
    await this.db
      .update(workOutputs)
      .set({ status: "ARCHIVED", updatedAt: now })
      .where(eq(workOutputs.id, id));
  }

  async exists(id: WorkOutputId): Promise<boolean> {
    const rows = await this.db.select({ id: workOutputs.id }).from(workOutputs).where(eq(workOutputs.id, id)).limit(1);
    return rows.length > 0;
  }
}
