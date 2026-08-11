import type { OrganizationId } from "@creative-lab/organization";
import type { Calendar } from "../aggregates/Calendar/Calendar.js";
import type { CalendarId } from "../types/ids.js";

export interface CalendarRepository {
  findById(id: CalendarId): Promise<Calendar | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Calendar[]>;
  findByName(
    organizationId: OrganizationId,
    name: string,
  ): Promise<Calendar | null>;
  findAll(): Promise<Calendar[]>;
  save(calendar: Calendar): Promise<void>;
  update(calendar: Calendar): Promise<void>;
  archive(id: CalendarId): Promise<void>;
  exists(id: CalendarId): Promise<boolean>;
}
