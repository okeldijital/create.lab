import type { DrizzleDatabase } from "@creative-lab/infrastructure";
import {
  PostgresBookingRepository,
  PostgresCalendarRepository,
  PostgresScheduleRepository,
  PostgresShiftRepository,
  PostgresTimeBlockRepository,
} from "@creative-lab/infrastructure";
import type { ApplicationComposition } from "./ApplicationComposition.js";

export const SCHEDULING_REPOSITORY_KEYS = {
  calendar: "calendar",
  schedule: "schedule",
  timeBlock: "timeBlock",
  booking: "booking",
  shift: "shift",
} as const;

export function registerPostgresSchedulingRepositories(
  composition: ApplicationComposition,
  database: DrizzleDatabase,
): void {
  composition.repositories.register(SCHEDULING_REPOSITORY_KEYS.calendar, new PostgresCalendarRepository(database));
  composition.repositories.register(SCHEDULING_REPOSITORY_KEYS.schedule, new PostgresScheduleRepository(database));
  composition.repositories.register(SCHEDULING_REPOSITORY_KEYS.timeBlock, new PostgresTimeBlockRepository(database));
  composition.repositories.register(SCHEDULING_REPOSITORY_KEYS.booking, new PostgresBookingRepository(database));
  composition.repositories.register(SCHEDULING_REPOSITORY_KEYS.shift, new PostgresShiftRepository(database));
}
