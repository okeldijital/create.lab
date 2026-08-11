import { describe, expect, it } from "vitest";
import {
  InvalidShiftError,
  InvalidTimeRangeError,
} from "../../errors/SchedulingErrors.js";
import {
  Duration,
  ScheduleName,
  TimeRange,
  WorkingTime,
} from "../../value-objects/index.js";

describe("Scheduling value objects", () => {
  it("TimeRange requires positive duration", () => {
    const start = new Date("2024-01-01T09:00:00Z");
    const end = new Date("2024-01-01T11:00:00Z");
    const range = TimeRange.create(start, end);
    expect(range.durationMs).toBe(2 * 60 * 60 * 1000);
    expect(() => TimeRange.create(end, start)).toThrow(InvalidTimeRangeError);
  });

  it("TimeRange detects overlaps", () => {
    const a = TimeRange.create(
      new Date("2024-01-01T09:00:00Z"),
      new Date("2024-01-01T12:00:00Z"),
    );
    const b = TimeRange.create(
      new Date("2024-01-01T11:00:00Z"),
      new Date("2024-01-01T13:00:00Z"),
    );
    const c = TimeRange.create(
      new Date("2024-01-01T12:00:00Z"),
      new Date("2024-01-01T14:00:00Z"),
    );
    expect(a.overlaps(b)).toBe(true);
    expect(a.overlaps(c)).toBe(false);
  });

  it("WorkingTime and Duration", () => {
    expect(WorkingTime.create("09:30").minutesSinceMidnight).toBe(9 * 60 + 30);
    expect(() => WorkingTime.create("25:00")).toThrow(InvalidShiftError);
    expect(Duration.fromMilliseconds(60_000).minutes).toBe(1);
    expect(() => Duration.fromMilliseconds(0)).toThrow(InvalidTimeRangeError);
  });

  it("ScheduleName required", () => {
    expect(ScheduleName.create("  Prod  ").value).toBe("Prod");
    expect(() => ScheduleName.create("")).toThrow();
  });
});
