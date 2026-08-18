import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { asWorkingPatternId } from "@creative-lab/capacity";
import type { OrganizationId } from "@creative-lab/organization";
import {
  Booking,
  Calendar,
  Schedule,
  Shift,
  ShiftType,
  TimeBlock,
  TimeBlockType,
} from "@creative-lab/scheduling";
import {
  BookingMapper,
  CalendarMapper,
  ScheduleMapper,
  ShiftMapper,
  TimeBlockMapper,
} from "../persistence/scheduling/mappers.js";

const id = (): string => randomUUID();
const organizationId = id() as OrganizationId;
const now = new Date("2026-01-01T00:00:00.000Z");

const calendar = Calendar.create({
  id: id(),
  organizationId,
  name: "Studio Calendar",
  description: "Primary studio calendar",
  timezone: "Africa/Johannesburg",
  now,
});

const schedule = Schedule.create({
  id: id(),
  organizationId,
  name: "Production Schedule",
  calendarId: calendar.id,
  timezone: "Africa/Johannesburg",
  purpose: "Weekly production planning",
  effectiveFrom: now,
  now,
});

const timeBlock = TimeBlock.create({
  id: id(),
  organizationId,
  scheduleId: schedule.id,
  start: new Date("2026-01-02T08:00:00.000Z"),
  end: new Date("2026-01-02T12:00:00.000Z"),
  type: TimeBlockType.BOOKABLE,
  now,
});

const booking = Booking.create({
  id: id(),
  organizationId,
  scheduleId: schedule.id,
  timeBlockId: timeBlock.id,
  title: "Client Session",
  bookingType: "STUDIO",
  resourceReference: "studio-a",
  notes: "Initial session",
  now,
});

const shift = Shift.create({
  id: id(),
  organizationId,
  name: "Morning Shift",
  startTime: "08:00",
  endTime: "16:00",
  workingPatternId: asWorkingPatternId(id()),
  shiftType: ShiftType.MORNING,
  now,
});

describe("Scheduling persistence mappers", () => {
  it("round-trips Calendar", () => {
    const restored = CalendarMapper.fromRow(CalendarMapper.toRow(calendar));
    expect(restored.toSnapshot()).toEqual(calendar.toSnapshot());
  });

  it("round-trips Schedule", () => {
    const restored = ScheduleMapper.fromRow(ScheduleMapper.toRow(schedule));
    expect(restored.toSnapshot()).toEqual(schedule.toSnapshot());
  });

  it("round-trips TimeBlock", () => {
    const restored = TimeBlockMapper.fromRow(TimeBlockMapper.toRow(timeBlock));
    expect(restored.toSnapshot()).toEqual(timeBlock.toSnapshot());
  });

  it("round-trips Booking", () => {
    const restored = BookingMapper.fromRow(BookingMapper.toRow(booking));
    expect(restored.toSnapshot()).toEqual(booking.toSnapshot());
  });

  it("round-trips Shift", () => {
    const restored = ShiftMapper.fromRow(ShiftMapper.toRow(shift));
    expect(restored.toSnapshot()).toEqual(shift.toSnapshot());
  });
});
