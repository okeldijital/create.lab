import type { OrganizationId } from "@creative-lab/organization";
import type { Booking } from "../aggregates/Booking/Booking.js";
import type { BookingId, ScheduleId, TimeBlockId } from "../types/ids.js";

export interface BookingRepository {
  findById(id: BookingId): Promise<Booking | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Booking[]>;
  findBySchedule(scheduleId: ScheduleId): Promise<Booking[]>;
  findByTimeBlock(timeBlockId: TimeBlockId): Promise<Booking[]>;
  findAll(): Promise<Booking[]>;
  save(booking: Booking): Promise<void>;
  update(booking: Booking): Promise<void>;
  archive(id: BookingId): Promise<void>;
  exists(id: BookingId): Promise<boolean>;
}
