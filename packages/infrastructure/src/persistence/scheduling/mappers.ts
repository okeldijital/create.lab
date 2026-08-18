import { asWorkingPatternId } from "@creative-lab/capacity";
import {
  Booking,
  Calendar,
  Schedule,
  Shift,
  TimeBlock,
  asBookingId,
  asCalendarId,
  asScheduleId,
  asShiftId,
  asTimeBlockId,
  type BookingSnapshot,
  type CalendarSnapshot,
  type ScheduleSnapshot,
  type ShiftSnapshot,
  type TimeBlockSnapshot,
} from "@creative-lab/scheduling";
import type { InferSelectModel } from "drizzle-orm";
import type { bookings, calendars, schedules, shifts, timeBlocks } from "./schema.js";

type CalendarRow = InferSelectModel<typeof calendars>;
type ScheduleRow = InferSelectModel<typeof schedules>;
type TimeBlockRow = InferSelectModel<typeof timeBlocks>;
type BookingRow = InferSelectModel<typeof bookings>;
type ShiftRow = InferSelectModel<typeof shifts>;

export const CalendarMapper = {
  toRow(calendar: Calendar): CalendarRow {
    const s = calendar.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      name: s.name,
      description: s.description,
      timezone: s.timezone,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: CalendarRow): Calendar {
    const snapshot: CalendarSnapshot = {
      id: asCalendarId(row.id),
      organizationId: row.organizationId as CalendarSnapshot["organizationId"],
      name: row.name,
      description: row.description ?? null,
      timezone: row.timezone,
      status: row.status as CalendarSnapshot["status"],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return Calendar.reconstitute(snapshot);
  },
};

export const ScheduleMapper = {
  toRow(schedule: Schedule): ScheduleRow {
    const s = schedule.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      name: s.name,
      timezone: s.timezone,
      status: s.status,
      calendarId: s.calendarId,
      purpose: s.purpose,
      effectiveFrom: s.effectiveFrom,
      effectiveTo: s.effectiveTo,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: ScheduleRow): Schedule {
    const snapshot: ScheduleSnapshot = {
      id: asScheduleId(row.id),
      organizationId: row.organizationId as ScheduleSnapshot["organizationId"],
      name: row.name,
      timezone: row.timezone,
      status: row.status as ScheduleSnapshot["status"],
      calendarId: asCalendarId(row.calendarId),
      purpose: row.purpose ?? null,
      effectiveFrom: new Date(row.effectiveFrom),
      effectiveTo: row.effectiveTo ? new Date(row.effectiveTo) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return Schedule.reconstitute(snapshot);
  },
};

export const TimeBlockMapper = {
  toRow(block: TimeBlock): TimeBlockRow {
    const s = block.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      scheduleId: s.scheduleId,
      startAt: s.start,
      endAt: s.end,
      blockType: s.type,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: TimeBlockRow): TimeBlock {
    const snapshot: TimeBlockSnapshot = {
      id: asTimeBlockId(row.id),
      organizationId: row.organizationId as TimeBlockSnapshot["organizationId"],
      scheduleId: asScheduleId(row.scheduleId),
      start: new Date(row.startAt),
      end: new Date(row.endAt),
      type: row.blockType as TimeBlockSnapshot["type"],
      status: row.status as TimeBlockSnapshot["status"],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return TimeBlock.reconstitute(snapshot);
  },
};

export const BookingMapper = {
  toRow(booking: Booking): BookingRow {
    const s = booking.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      scheduleId: s.scheduleId,
      timeBlockId: s.timeBlockId,
      title: s.title,
      bookingType: s.bookingType,
      resourceReference: s.resourceReference,
      status: s.status,
      notes: s.notes,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: BookingRow): Booking {
    const snapshot: BookingSnapshot = {
      id: asBookingId(row.id),
      organizationId: row.organizationId as BookingSnapshot["organizationId"],
      scheduleId: asScheduleId(row.scheduleId),
      timeBlockId: asTimeBlockId(row.timeBlockId),
      title: row.title,
      bookingType: row.bookingType ?? null,
      resourceReference: row.resourceReference ?? null,
      status: row.status as BookingSnapshot["status"],
      notes: row.notes ?? null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return Booking.reconstitute(snapshot);
  },
};

export const ShiftMapper = {
  toRow(shift: Shift): ShiftRow {
    const s = shift.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      name: s.name,
      startTime: s.startTime,
      endTime: s.endTime,
      workingPatternId: s.workingPatternId,
      shiftType: s.shiftType,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: ShiftRow): Shift {
    const snapshot: ShiftSnapshot = {
      id: asShiftId(row.id),
      organizationId: row.organizationId as ShiftSnapshot["organizationId"],
      name: row.name,
      startTime: row.startTime,
      endTime: row.endTime,
      workingPatternId: asWorkingPatternId(row.workingPatternId),
      shiftType: row.shiftType as ShiftSnapshot["shiftType"],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return Shift.reconstitute(snapshot);
  },
};
