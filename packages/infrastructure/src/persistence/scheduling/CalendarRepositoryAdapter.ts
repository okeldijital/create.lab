import type { OrganizationId } from "@creative-lab/organization";
import type { Calendar, CalendarId, CalendarRepository } from "@creative-lab/scheduling";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { calendars } from "./schema.js";
import { CalendarMapper } from "./mappers.js";

export class PostgresCalendarRepository implements CalendarRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: CalendarId): Promise<Calendar | null> {
    const rows = await this.db.select().from(calendars).where(eq(calendars.id, id)).limit(1);
    return rows[0] ? CalendarMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<Calendar[]> {
    const rows = await this.db.select().from(calendars).where(eq(calendars.organizationId, organizationId));
    return rows.map(CalendarMapper.fromRow);
  }

  async findByName(organizationId: OrganizationId, name: string): Promise<Calendar | null> {
    const rows = await this.db
      .select()
      .from(calendars)
      .where(and(eq(calendars.organizationId, organizationId), eq(calendars.name, name)))
      .limit(1);
    return rows[0] ? CalendarMapper.fromRow(rows[0]) : null;
  }

  async findAll(): Promise<Calendar[]> {
    const rows = await this.db.select().from(calendars);
    return rows.map(CalendarMapper.fromRow);
  }

  async save(calendar: Calendar): Promise<void> {
    await this.db.insert(calendars).values(CalendarMapper.toRow(calendar));
  }

  async update(calendar: Calendar): Promise<void> {
    await this.db.update(calendars).set(CalendarMapper.toRow(calendar)).where(eq(calendars.id, calendar.id));
  }

  async archive(id: CalendarId): Promise<void> {
    const now = new Date();
    await this.db.update(calendars).set({ status: "ARCHIVED", updatedAt: now }).where(eq(calendars.id, id));
  }

  async exists(id: CalendarId): Promise<boolean> {
    const rows = await this.db.select({ id: calendars.id }).from(calendars).where(eq(calendars.id, id)).limit(1);
    return rows.length > 0;
  }
}
