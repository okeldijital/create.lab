import type {
  AllocationGroup,
  AllocationGroupId,
  AllocationGroupRepository,
} from "@creative-lab/allocation";
import type { OrganizationId } from "@creative-lab/organization";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { allocationGroups } from "./schema.js";
import { AllocationGroupMapper } from "./mappers.js";

export class PostgresAllocationGroupRepository implements AllocationGroupRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: AllocationGroupId): Promise<AllocationGroup | null> {
    const rows = await this.db.select().from(allocationGroups).where(eq(allocationGroups.id, id)).limit(1);
    return rows[0] ? AllocationGroupMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<AllocationGroup[]> {
    const rows = await this.db
      .select()
      .from(allocationGroups)
      .where(eq(allocationGroups.organizationId, organizationId));
    return rows.map(AllocationGroupMapper.fromRow);
  }

  async save(group: AllocationGroup): Promise<void> {
    await this.db.insert(allocationGroups).values(AllocationGroupMapper.toRow(group));
  }

  async update(group: AllocationGroup): Promise<void> {
    await this.db
      .update(allocationGroups)
      .set(AllocationGroupMapper.toRow(group))
      .where(eq(allocationGroups.id, group.id));
  }

  async archive(id: AllocationGroupId): Promise<void> {
    // Domain archive is archived boolean (soft).
    const now = new Date();
    await this.db
      .update(allocationGroups)
      .set({ archived: true, updatedAt: now })
      .where(eq(allocationGroups.id, id));
  }

  async exists(id: AllocationGroupId): Promise<boolean> {
    const rows = await this.db
      .select({ id: allocationGroups.id })
      .from(allocationGroups)
      .where(eq(allocationGroups.id, id))
      .limit(1);
    return rows.length > 0;
  }
}
