import type { OrganizationId } from "@creative-lab/organization";
import type { Schedule } from "../aggregates/Schedule/Schedule.js";
import type { CalendarId, ScheduleId } from "../types/ids.js";

export interface ScheduleRepository {
  findById(id: ScheduleId): Promise<Schedule | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Schedule[]>;
  findByCalendar(calendarId: CalendarId): Promise<Schedule[]>;
  findAll(): Promise<Schedule[]>;
  save(schedule: Schedule): Promise<void>;
  update(schedule: Schedule): Promise<void>;
  archive(id: ScheduleId): Promise<void>;
  exists(id: ScheduleId): Promise<boolean>;
}
