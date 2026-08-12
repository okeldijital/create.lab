import type { OrganizationId } from "@creative-lab/organization";
import type { CalendarId, Schedule, ScheduleId, ScheduleRepository } from "@creative-lab/scheduling";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { schedules } from "./schema.js";
import { ScheduleMapper } from "./mappers.js";

export class PostgresScheduleRepository implements ScheduleRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: ScheduleId): Promise<Schedule | null> {
    const rows = await this.db.select().from(schedules).where(eq(schedules.id, id)).limit(1);
    return rows[0] ? ScheduleMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<Schedule[]> {
    const rows = await this.db.select().from(schedules).where(eq(schedules.organizationId, organizationId));
    return rows.map(ScheduleMapper.fromRow);
  }

  async findByCalendar(calendarId: CalendarId): Promise<Schedule[]> {
    const rows = await this.db.select().from(schedules).where(eq(schedules.calendarId, calendarId));
    return rows.map(ScheduleMapper.fromRow);
  }

  async findAll(): Promise<Schedule[]> {
    const rows = await this.db.select().from(schedules);
    return rows.map(ScheduleMapper.fromRow);
  }

  async save(schedule: Schedule): Promise<void> {
    await this.db.insert(schedules).values(ScheduleMapper.toRow(schedule));
  }

  async update(schedule: Schedule): Promise<void> {
    await this.db.update(schedules).set(ScheduleMapper.toRow(schedule)).where(eq(schedules.id, schedule.id));
  }

  async archive(id: ScheduleId): Promise<void> {
    const now = new Date();
    await this.db.update(schedules).set({ status: "ARCHIVED", updatedAt: now }).where(eq(schedules.id, id));
  }

  async exists(id: ScheduleId): Promise<boolean> {
    const rows = await this.db.select({ id: schedules.id }).from(schedules).where(eq(schedules.id, id)).limit(1);
    return rows.length > 0;
  }
}
