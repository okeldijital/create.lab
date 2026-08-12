import type {
  Allocation,
  AllocationId,
  AllocationRepository,
} from "@creative-lab/allocation";
import type { WorkOrderId } from "@creative-lab/operations";
import type { OrganizationId } from "@creative-lab/organization";
import type { ProjectId } from "@creative-lab/projects";
import { eq, inArray } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { allocations } from "./schema.js";
import { AllocationMapper } from "./mappers.js";

export class PostgresAllocationRepository implements AllocationRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: AllocationId): Promise<Allocation | null> {
    const rows = await this.db.select().from(allocations).where(eq(allocations.id, id)).limit(1);
    return rows[0] ? AllocationMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<Allocation[]> {
    const rows = await this.db
      .select()
      .from(allocations)
      .where(eq(allocations.organizationId, organizationId));
    return rows.map(AllocationMapper.fromRow);
  }

  async findByProject(projectId: ProjectId): Promise<Allocation[]> {
    const rows = await this.db.select().from(allocations).where(eq(allocations.projectId, projectId));
    return rows.map(AllocationMapper.fromRow);
  }

  async findByWorkOrder(workOrderId: WorkOrderId): Promise<Allocation[]> {
    const rows = await this.db.select().from(allocations).where(eq(allocations.workOrderId, workOrderId));
    return rows.map(AllocationMapper.fromRow);
  }

  async findByResource(resourceId: string): Promise<Allocation[]> {
    const rows = await this.db.select().from(allocations).where(eq(allocations.resourceId, resourceId));
    return rows.map(AllocationMapper.fromRow);
  }

  async findActive(): Promise<Allocation[]> {
    const rows = await this.db
      .select()
      .from(allocations)
      .where(inArray(allocations.status, ["PLANNED", "ACTIVE", "ON_HOLD"]));
    return rows.map(AllocationMapper.fromRow);
  }

  async save(allocation: Allocation): Promise<void> {
    await this.db.insert(allocations).values(AllocationMapper.toRow(allocation));
  }

  async update(allocation: Allocation): Promise<void> {
    await this.db
      .update(allocations)
      .set(AllocationMapper.toRow(allocation))
      .where(eq(allocations.id, allocation.id));
  }

  async archive(id: AllocationId): Promise<void> {
    // Domain archive state is AllocationStatus.ARCHIVED (soft archive).
    const now = new Date();
    await this.db
      .update(allocations)
      .set({ status: "ARCHIVED", updatedAt: now })
      .where(eq(allocations.id, id));
  }

  async exists(id: AllocationId): Promise<boolean> {
    const rows = await this.db.select({ id: allocations.id }).from(allocations).where(eq(allocations.id, id)).limit(1);
    return rows.length > 0;
  }
}
