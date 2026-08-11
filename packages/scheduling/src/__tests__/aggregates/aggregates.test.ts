import { describe, expect, it } from "vitest";
import { asWorkingPatternId } from "@creative-lab/capacity";
import { asOrganizationId } from "@creative-lab/organization";
import { Booking } from "../../aggregates/Booking/Booking.js";
import { Calendar } from "../../aggregates/Calendar/Calendar.js";
import { Schedule } from "../../aggregates/Schedule/Schedule.js";
import { Shift } from "../../aggregates/Shift/Shift.js";
import { TimeBlock } from "../../aggregates/TimeBlock/TimeBlock.js";
import { BookingStatus } from "../../enums/BookingStatus.js";
import { TimeBlockType } from "../../enums/TimeBlockType.js";
import {
  ArchivedScheduleError,
  BookingLifecycleError,
  InvalidShiftError,
  InvalidTimeRangeError,
} from "../../errors/SchedulingErrors.js";
import {
  BookingCreated,
  ScheduleCreated,
  TimeBlockCreated,
} from "../../events/scheduling-events.js";
import { asCalendarId, asScheduleId, asTimeBlockId } from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const calendarId = asCalendarId("cal-1");

describe("Scheduling aggregates", () => {
  it("creates Schedule with immutable timezone semantics", () => {
    const schedule = Schedule.create({
      organizationId: orgId,
      name: "Production",
      calendarId,
      timezone: "America/New_York",
    });
    expect(schedule.timezone.value).toBe("America/New_York");
    expect(schedule.pullDomainEvents()[0]).toBeInstanceOf(ScheduleCreated);
  });

  it("archives schedule and rejects bookings", () => {
    const schedule = Schedule.create({
      organizationId: orgId,
      name: "Prod",
      calendarId,
    });
    schedule.pullDomainEvents();
    schedule.archive();
    expect(() => schedule.assertAcceptsBookings()).toThrow(
      ArchivedScheduleError,
    );
  });

  it("creates Calendar", () => {
    const calendar = Calendar.create({
      organizationId: orgId,
      name: "Studio A",
      timezone: "UTC",
    });
    expect(calendar.name.value).toBe("Studio A");
  });

  it("TimeBlock requires end after start", () => {
    const start = new Date("2024-06-01T09:00:00Z");
    const end = new Date("2024-06-01T11:00:00Z");
    const block = TimeBlock.create({
      organizationId: orgId,
      scheduleId: asScheduleId("s1"),
      start,
      end,
      type: TimeBlockType.BOOKABLE,
    });
    expect(block.pullDomainEvents()[0]).toBeInstanceOf(TimeBlockCreated);
    expect(() =>
      TimeBlock.create({
        organizationId: orgId,
        scheduleId: asScheduleId("s1"),
        start: end,
        end: start,
        type: TimeBlockType.BOOKABLE,
      }),
    ).toThrow(InvalidTimeRangeError);
  });

  it("Booking lifecycle", () => {
    const booking = Booking.create({
      organizationId: orgId,
      scheduleId: asScheduleId("s1"),
      timeBlockId: asTimeBlockId("tb1"),
      title: "Mixing Session",
    });
    expect(booking.pullDomainEvents()[0]).toBeInstanceOf(BookingCreated);
    booking.confirm();
    expect(booking.status).toBe(BookingStatus.CONFIRMED);
    booking.cancel();
    expect(booking.status).toBe(BookingStatus.CANCELLED);
    expect(() => booking.complete()).toThrow(BookingLifecycleError);
  });

  it("Shift supports overnight duration", () => {
    const shift = Shift.create({
      organizationId: orgId,
      name: "Night",
      startTime: "22:00",
      endTime: "06:00",
      workingPatternId: asWorkingPatternId("wp1"),
    });
    expect(shift.isOvernight).toBe(true);
    expect(shift.durationMinutes).toBe(8 * 60);
    expect(() =>
      Shift.create({
        organizationId: orgId,
        name: "Zero",
        startTime: "09:00",
        endTime: "09:00",
        workingPatternId: asWorkingPatternId("wp1"),
      }),
    ).toThrow(InvalidShiftError);
  });
});
