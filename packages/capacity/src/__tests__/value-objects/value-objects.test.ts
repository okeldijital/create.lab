import { describe, expect, it } from "vitest";
import { CapacityUnit } from "../../enums/CapacityUnit.js";
import { CapabilityLevel } from "../../enums/CapabilityLevel.js";
import {
  InvalidAvailabilityProfileError,
  InvalidCapacityQuantityError,
  InvalidWorkingPatternError,
} from "../../errors/CapacityErrors.js";
import {
  CapabilityName,
  CapacityQuantity,
  HoursPerDay,
  HoursPerWeek,
  ProficiencyLevel,
  Timezone,
  Weekday,
  WorkingDaySet,
  WorkingHours,
} from "../../value-objects/index.js";

describe("Capacity value objects", () => {
  it("CapacityQuantity requires positive quantity and unit", () => {
    const q = CapacityQuantity.create(40, CapacityUnit.HOURS);
    expect(q.quantity).toBe(40);
    expect(() => CapacityQuantity.create(0, CapacityUnit.HOURS)).toThrow(
      InvalidCapacityQuantityError,
    );
  });

  it("HoursPerWeek / HoursPerDay validate bounds", () => {
    expect(HoursPerWeek.create(40).value).toBe(40);
    expect(() => HoursPerWeek.create(-1)).toThrow(InvalidWorkingPatternError);
    expect(() => HoursPerDay.create(25)).toThrow(InvalidWorkingPatternError);
  });

  it("CapabilityName case-insensitive equality", () => {
    expect(
      CapabilityName.create("Mixing").equals(CapabilityName.create("mixing")),
    ).toBe(true);
  });

  it("WorkingDaySet and WorkingHours", () => {
    const days = WorkingDaySet.mondayToFriday();
    expect(days.includes(Weekday.MONDAY)).toBe(true);
    expect(days.includes(Weekday.SUNDAY)).toBe(false);
    const hours = WorkingHours.create("09:00", "17:00");
    expect(hours.start).toBe("09:00");
    expect(() => WorkingHours.create("17:00", "09:00")).toThrow(
      InvalidAvailabilityProfileError,
    );
  });

  it("Timezone and ProficiencyLevel", () => {
    expect(Timezone.create("UTC").value).toBe("UTC");
    expect(ProficiencyLevel.create(CapabilityLevel.EXPERT).level).toBe(
      CapabilityLevel.EXPERT,
    );
  });
});
