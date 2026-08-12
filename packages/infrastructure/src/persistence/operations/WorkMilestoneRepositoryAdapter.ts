import type { OrganizationId } from "@creative-lab/organization";
import type {
  WorkMilestone,
  WorkMilestoneId,
  WorkMilestoneRepository,
  WorkOrderId,
} from "@creative-lab/operations";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { workMilestones } from "./schema.js";
import { WorkMilestoneMapper } from "./mappers.js";

export class PostgresWorkMilestoneRepository implements WorkMilestoneRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: WorkMilestoneId): Promise<WorkMilestone | null> {
    const rows = await this.db.select().from(workMilestones).where(eq(workMilestones.id, id)).limit(1);
    return rows[0] ? WorkMilestoneMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<WorkMilestone[]> {
    const rows = await this.db
      .select()
      .from(workMilestones)
      .where(eq(workMilestones.organizationId, organizationId));
    return rows.map(WorkMilestoneMapper.fromRow);
  }

  async findByWorkOrder(workOrderId: WorkOrderId): Promise<WorkMilestone[]> {
    const rows = await this.db.select().from(workMilestones).where(eq(workMilestones.workOrderId, workOrderId));
    return rows.map(WorkMilestoneMapper.fromRow);
  }

  async findActive(): Promise<WorkMilestone[]> {
    const rows = await this.db.select().from(workMilestones).where(eq(workMilestones.completed, false));
    return rows.map(WorkMilestoneMapper.fromRow);
  }

  async save(milestone: WorkMilestone): Promise<void> {
    await this.db.insert(workMilestones).values(WorkMilestoneMapper.toRow(milestone));
  }

  async update(milestone: WorkMilestone): Promise<void> {
    await this.db
      .update(workMilestones)
      .set(WorkMilestoneMapper.toRow(milestone))
      .where(eq(workMilestones.id, milestone.id));
  }

  async archive(id: WorkMilestoneId): Promise<void> {
    // WorkMilestone has no archive status; hard delete implements repository archive without inventing lifecycle.
    await this.db.delete(workMilestones).where(eq(workMilestones.id, id));
  }

  async exists(id: WorkMilestoneId): Promise<boolean> {
    const rows = await this.db
      .select({ id: workMilestones.id })
      .from(workMilestones)
      .where(eq(workMilestones.id, id))
      .limit(1);
    return rows.length > 0;
  }
}
