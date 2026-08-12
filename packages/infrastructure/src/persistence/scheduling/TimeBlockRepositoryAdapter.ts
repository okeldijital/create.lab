import type { OrganizationId } from "@creative-lab/organization";
import type { ScheduleId, TimeBlock, TimeBlockId, TimeBlockRepository } from "@creative-lab/scheduling";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { timeBlocks } from "./schema.js";
import { TimeBlockMapper } from "./mappers.js";

export class PostgresTimeBlockRepository implements TimeBlockRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: TimeBlockId): Promise<TimeBlock | null> {
    const rows = await this.db.select().from(timeBlocks).where(eq(timeBlocks.id, id)).limit(1);
    return rows[0] ? TimeBlockMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<TimeBlock[]> {
    const rows = await this.db.select().from(timeBlocks).where(eq(timeBlocks.organizationId, organizationId));
    return rows.map(TimeBlockMapper.fromRow);
  }

  async findBySchedule(scheduleId: ScheduleId): Promise<TimeBlock[]> {
    const rows = await this.db.select().from(timeBlocks).where(eq(timeBlocks.scheduleId, scheduleId));
    return rows.map(TimeBlockMapper.fromRow);
  }

  async findAll(): Promise<TimeBlock[]> {
    const rows = await this.db.select().from(timeBlocks);
    return rows.map(TimeBlockMapper.fromRow);
  }

  async save(block: TimeBlock): Promise<void> {
    await this.db.insert(timeBlocks).values(TimeBlockMapper.toRow(block));
  }

  async update(block: TimeBlock): Promise<void> {
    await this.db.update(timeBlocks).set(TimeBlockMapper.toRow(block)).where(eq(timeBlocks.id, block.id));
  }

  async archive(id: TimeBlockId): Promise<void> {
    const now = new Date();
    await this.db.update(timeBlocks).set({ status: "REMOVED", updatedAt: now }).where(eq(timeBlocks.id, id));
  }

  async exists(id: TimeBlockId): Promise<boolean> {
    const rows = await this.db.select({ id: timeBlocks.id }).from(timeBlocks).where(eq(timeBlocks.id, id)).limit(1);
    return rows.length > 0;
  }
}
