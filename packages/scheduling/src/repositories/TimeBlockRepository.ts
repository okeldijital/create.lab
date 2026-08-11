import type { OrganizationId } from "@creative-lab/organization";
import type { TimeBlock } from "../aggregates/TimeBlock/TimeBlock.js";
import type { ScheduleId, TimeBlockId } from "../types/ids.js";

export interface TimeBlockRepository {
  findById(id: TimeBlockId): Promise<TimeBlock | null>;
  findByOrganization(organizationId: OrganizationId): Promise<TimeBlock[]>;
  findBySchedule(scheduleId: ScheduleId): Promise<TimeBlock[]>;
  findAll(): Promise<TimeBlock[]>;
  save(block: TimeBlock): Promise<void>;
  update(block: TimeBlock): Promise<void>;
  archive(id: TimeBlockId): Promise<void>;
  exists(id: TimeBlockId): Promise<boolean>;
}
