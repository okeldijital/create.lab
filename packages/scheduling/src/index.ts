/**
 * @creative-lab/scheduling
 *
 * Scheduling bounded context — EPIC-204.
 * Temporal planning: calendars, schedules, time blocks, bookings, shifts.
 * Does not assign work (Allocation) or assess capability (Capacity).
 */

export {
  Schedule,
  Calendar,
  TimeBlock,
  Booking,
  Shift,
} from "./aggregates/index.js";
export type {
  CreateScheduleProps,
  ScheduleSnapshot,
  CreateCalendarProps,
  CalendarSnapshot,
  CreateTimeBlockProps,
  TimeBlockSnapshot,
  CreateBookingProps,
  BookingSnapshot,
  CreateShiftProps,
  ShiftSnapshot,
} from "./aggregates/index.js";

export {
  ScheduleName,
  CalendarName,
  BookingTitle,
  TimeRange,
  Timezone,
  WorkingDate,
  WorkingTime,
  Duration,
  BookingReference,
} from "./value-objects/index.js";

export {
  ScheduleStatus,
  CalendarStatus,
  BookingStatus,
  TimeBlockType,
  TimeBlockStatus,
  ShiftType,
} from "./enums/index.js";

export {
  ScheduleCreated,
  ScheduleArchived,
  CalendarCreated,
  BookingCreated,
  BookingCancelled,
  BookingCompleted,
  TimeBlockCreated,
  TimeBlockRemoved,
  ShiftCreated,
  ShiftUpdated,
} from "./events/index.js";

export type {
  ScheduleRepository,
  CalendarRepository,
  TimeBlockRepository,
  BookingRepository,
  ShiftRepository,
} from "./repositories/index.js";

export {
  ScheduleService,
  CalendarService,
  BookingService,
  TimeBlockService,
  ShiftService,
} from "./services/index.js";
export type {
  ScheduleServiceDeps,
  CalendarServiceDeps,
  BookingServiceDeps,
  TimeBlockServiceDeps,
  ShiftServiceDeps,
} from "./services/index.js";

export {
  ScheduleLifecyclePolicy,
  TimeBlockPolicy,
  BookingPolicy,
  ShiftPolicy,
} from "./policies/index.js";

export {
  ScheduleFactory,
  CalendarFactory,
  TimeBlockFactory,
  BookingFactory,
  ShiftFactory,
} from "./factories/index.js";

export {
  ScheduleNotFoundError,
  CalendarNotFoundError,
  BookingConflictError,
  TimeBlockOverlapError,
  InvalidTimeRangeError,
  InvalidShiftError,
  ArchivedScheduleError,
  BookingLifecycleError,
  ScheduleValidationError,
  TimeBlockNotFoundError,
  BookingNotFoundError,
  ShiftNotFoundError,
  DuplicateCalendarNameError,
} from "./errors/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export type {
  ScheduleId,
  CalendarId,
  TimeBlockId,
  BookingId,
  ShiftId,
  OrganizationId,
} from "./types/index.js";
export {
  asScheduleId,
  asCalendarId,
  asTimeBlockId,
  asBookingId,
  asShiftId,
  asOrganizationId,
} from "./types/index.js";
