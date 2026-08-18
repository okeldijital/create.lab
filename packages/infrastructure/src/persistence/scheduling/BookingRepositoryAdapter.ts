import type { OrganizationId } from "@creative-lab/organization";
import type { Booking, BookingId, BookingRepository, ScheduleId, TimeBlockId } from "@creative-lab/scheduling";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { bookings } from "./schema.js";
import { BookingMapper } from "./mappers.js";

export class PostgresBookingRepository implements BookingRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: BookingId): Promise<Booking | null> {
    const rows = await this.db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return rows[0] ? BookingMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<Booking[]> {
    const rows = await this.db.select().from(bookings).where(eq(bookings.organizationId, organizationId));
    return rows.map(BookingMapper.fromRow);
  }

  async findBySchedule(scheduleId: ScheduleId): Promise<Booking[]> {
    const rows = await this.db.select().from(bookings).where(eq(bookings.scheduleId, scheduleId));
    return rows.map(BookingMapper.fromRow);
  }

  async findByTimeBlock(timeBlockId: TimeBlockId): Promise<Booking[]> {
    const rows = await this.db.select().from(bookings).where(eq(bookings.timeBlockId, timeBlockId));
    return rows.map(BookingMapper.fromRow);
  }

  async findAll(): Promise<Booking[]> {
    const rows = await this.db.select().from(bookings);
    return rows.map(BookingMapper.fromRow);
  }

  async save(booking: Booking): Promise<void> {
    await this.db.insert(bookings).values(BookingMapper.toRow(booking));
  }

  async update(booking: Booking): Promise<void> {
    await this.db.update(bookings).set(BookingMapper.toRow(booking)).where(eq(bookings.id, booking.id));
  }

  async archive(id: BookingId): Promise<void> {
    // Booking has no ARCHIVED status; hard delete implements repository archive without inventing lifecycle.
    await this.db.delete(bookings).where(eq(bookings.id, id));
  }

  async exists(id: BookingId): Promise<boolean> {
    const rows = await this.db.select({ id: bookings.id }).from(bookings).where(eq(bookings.id, id)).limit(1);
    return rows.length > 0;
  }
}
