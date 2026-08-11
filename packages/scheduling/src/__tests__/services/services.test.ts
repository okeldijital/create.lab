import { describe, expect, it, beforeEach } from "vitest";
import { WorkingPattern } from "@creative-lab/capacity";
import { TimeBlockType } from "../../enums/TimeBlockType.js";
import {
  ArchivedScheduleError,
  BookingConflictError,
  TimeBlockOverlapError,
} from "../../errors/SchedulingErrors.js";
import { ScheduleCreated } from "../../events/scheduling-events.js";
import { BookingService } from "../../services/BookingService.js";
import { CalendarService } from "../../services/CalendarService.js";
import { ScheduleService } from "../../services/ScheduleService.js";
import { ShiftService } from "../../services/ShiftService.js";
import { TimeBlockService } from "../../services/TimeBlockService.js";
import {
  InMemoryBookingRepository,
  InMemoryCalendarRepository,
  InMemoryEventPublisher,
  InMemoryOrganizationRepository,
  InMemoryScheduleRepository,
  InMemoryShiftRepository,
  InMemoryTimeBlockRepository,
  InMemoryWorkingPatternRepository,
  seedOrganization,
} from "../helpers/in-memory.js";

describe("Scheduling services", () => {
  let orgs: InMemoryOrganizationRepository;
  let calendars: InMemoryCalendarRepository;
  let schedules: InMemoryScheduleRepository;
  let blocks: InMemoryTimeBlockRepository;
  let bookings: InMemoryBookingRepository;
  let shifts: InMemoryShiftRepository;
  let patterns: InMemoryWorkingPatternRepository;
  let events: InMemoryEventPublisher;
  let calendarService: CalendarService;
  let scheduleService: ScheduleService;
  let timeBlockService: TimeBlockService;
  let bookingService: BookingService;
  let shiftService: ShiftService;

  beforeEach(() => {
    orgs = new InMemoryOrganizationRepository();
    calendars = new InMemoryCalendarRepository();
    schedules = new InMemoryScheduleRepository();
    blocks = new InMemoryTimeBlockRepository();
    bookings = new InMemoryBookingRepository();
    shifts = new InMemoryShiftRepository();
    patterns = new InMemoryWorkingPatternRepository();
    events = new InMemoryEventPublisher();

    calendarService = new CalendarService({
      calendarRepository: calendars,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    scheduleService = new ScheduleService({
      scheduleRepository: schedules,
      calendarRepository: calendars,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    timeBlockService = new TimeBlockService({
      timeBlockRepository: blocks,
      scheduleRepository: schedules,
      eventPublisher: events,
    });
    bookingService = new BookingService({
      bookingRepository: bookings,
      scheduleRepository: schedules,
      timeBlockRepository: blocks,
      eventPublisher: events,
    });
    shiftService = new ShiftService({
      shiftRepository: shifts,
      organizationRepository: orgs,
      workingPatternRepository: patterns,
      eventPublisher: events,
    });
  });

  it("creates calendar, schedule, block, and booking", async () => {
    const organization = await seedOrganization(orgs);
    const calendar = await calendarService.create({
      organizationId: organization.id,
      name: "Production",
    });
    const schedule = await scheduleService.create({
      organizationId: organization.id,
      name: "Week 24",
      calendarId: calendar.id,
      purpose: "production",
    });
    expect(events.events.some((e) => e instanceof ScheduleCreated)).toBe(true);

    const block = await timeBlockService.create({
      organizationId: organization.id,
      scheduleId: schedule.id,
      start: new Date("2024-06-10T09:00:00Z"),
      end: new Date("2024-06-10T12:00:00Z"),
      type: TimeBlockType.BOOKABLE,
    });
    const booking = await bookingService.create({
      organizationId: organization.id,
      scheduleId: schedule.id,
      timeBlockId: block.id,
      title: "Recording Session",
    });
    expect(booking.title.value).toBe("Recording Session");
  });

  it("rejects overlapping time blocks", async () => {
    const organization = await seedOrganization(orgs);
    const calendar = await calendarService.create({
      organizationId: organization.id,
      name: "Studio",
    });
    const schedule = await scheduleService.create({
      organizationId: organization.id,
      name: "Main",
      calendarId: calendar.id,
    });
    await timeBlockService.create({
      organizationId: organization.id,
      scheduleId: schedule.id,
      start: new Date("2024-06-10T09:00:00Z"),
      end: new Date("2024-06-10T12:00:00Z"),
      type: TimeBlockType.BOOKABLE,
    });
    await expect(
      timeBlockService.create({
        organizationId: organization.id,
        scheduleId: schedule.id,
        start: new Date("2024-06-10T11:00:00Z"),
        end: new Date("2024-06-10T13:00:00Z"),
        type: TimeBlockType.BOOKABLE,
      }),
    ).rejects.toBeInstanceOf(TimeBlockOverlapError);
  });

  it("rejects booking on archived schedule", async () => {
    const organization = await seedOrganization(orgs);
    const calendar = await calendarService.create({
      organizationId: organization.id,
      name: "Studio",
    });
    const schedule = await scheduleService.create({
      organizationId: organization.id,
      name: "Main",
      calendarId: calendar.id,
    });
    const block = await timeBlockService.create({
      organizationId: organization.id,
      scheduleId: schedule.id,
      start: new Date("2024-06-10T09:00:00Z"),
      end: new Date("2024-06-10T10:00:00Z"),
      type: TimeBlockType.BOOKABLE,
    });
    await scheduleService.archive(schedule.id);
    await expect(
      bookingService.create({
        organizationId: organization.id,
        scheduleId: schedule.id,
        timeBlockId: block.id,
        title: "Nope",
      }),
    ).rejects.toBeInstanceOf(ArchivedScheduleError);
  });

  it("rejects double booking on same time block", async () => {
    const organization = await seedOrganization(orgs);
    const calendar = await calendarService.create({
      organizationId: organization.id,
      name: "Studio",
    });
    const schedule = await scheduleService.create({
      organizationId: organization.id,
      name: "Main",
      calendarId: calendar.id,
    });
    const block = await timeBlockService.create({
      organizationId: organization.id,
      scheduleId: schedule.id,
      start: new Date("2024-06-10T09:00:00Z"),
      end: new Date("2024-06-10T10:00:00Z"),
      type: TimeBlockType.BOOKABLE,
    });
    await bookingService.create({
      organizationId: organization.id,
      scheduleId: schedule.id,
      timeBlockId: block.id,
      title: "First",
    });
    await expect(
      bookingService.create({
        organizationId: organization.id,
        scheduleId: schedule.id,
        timeBlockId: block.id,
        title: "Second",
      }),
    ).rejects.toBeInstanceOf(BookingConflictError);
  });

  it("creates shift with working pattern", async () => {
    const organization = await seedOrganization(orgs);
    const pattern = WorkingPattern.create({
      organizationId: organization.id,
      hoursPerWeek: 40,
      hoursPerDay: 8,
      daysPerWeek: 5,
    });
    pattern.pullDomainEvents();
    await patterns.save(pattern);
    const shift = await shiftService.create({
      organizationId: organization.id,
      name: "Morning",
      startTime: "09:00",
      endTime: "17:00",
      workingPatternId: pattern.id,
    });
    expect(shift.durationMinutes).toBe(8 * 60);
  });
});
