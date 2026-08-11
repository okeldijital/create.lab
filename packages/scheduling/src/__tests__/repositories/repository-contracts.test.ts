import { describe, expect, it } from "vitest";
import type {
  BookingRepository,
  CalendarRepository,
  ScheduleRepository,
  ShiftRepository,
  TimeBlockRepository,
} from "../../repositories/index.js";
import {
  InMemoryBookingRepository,
  InMemoryCalendarRepository,
  InMemoryScheduleRepository,
  InMemoryShiftRepository,
  InMemoryTimeBlockRepository,
} from "../helpers/in-memory.js";

describe("Repository interface compliance", () => {
  function assertMethods(repo: object, methods: string[]): void {
    for (const m of methods) {
      expect(typeof (repo as Record<string, unknown>)[m]).toBe("function");
    }
  }
  const base = [
    "findById",
    "findAll",
    "save",
    "update",
    "archive",
    "exists",
    "findByOrganization",
  ];

  it("ScheduleRepository", () => {
    const repo: ScheduleRepository = new InMemoryScheduleRepository();
    assertMethods(repo, [...base, "findByCalendar"]);
  });
  it("CalendarRepository", () => {
    const repo: CalendarRepository = new InMemoryCalendarRepository();
    assertMethods(repo, [...base, "findByName"]);
  });
  it("TimeBlockRepository", () => {
    const repo: TimeBlockRepository = new InMemoryTimeBlockRepository();
    assertMethods(repo, [...base, "findBySchedule"]);
  });
  it("BookingRepository", () => {
    const repo: BookingRepository = new InMemoryBookingRepository();
    assertMethods(repo, [...base, "findBySchedule", "findByTimeBlock"]);
  });
  it("ShiftRepository", () => {
    const repo: ShiftRepository = new InMemoryShiftRepository();
    assertMethods(repo, base);
  });
});
