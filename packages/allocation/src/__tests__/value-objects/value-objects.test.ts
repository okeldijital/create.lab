import { describe, expect, it } from "vitest";
import { AllocationPriority as PriorityEnum } from "../../enums/AllocationPriority.js";
import {
  AllocationValidationError,
  InvalidAllocationPercentageError,
} from "../../errors/AllocationErrors.js";
import { AllocationName } from "../../value-objects/AllocationName.js";
import { AllocationNotes } from "../../value-objects/AllocationNotes.js";
import { AllocationPercentage } from "../../value-objects/AllocationPercentage.js";
import { AllocationPriorityVO } from "../../value-objects/AllocationPriority.js";
import { AllocationReason } from "../../value-objects/AllocationReason.js";
import { ReservationPeriod } from "../../value-objects/ReservationPeriod.js";

describe("Value objects", () => {
  it("AllocationPercentage 1–100 integer", () => {
    expect(AllocationPercentage.create(1).value).toBe(1);
    expect(AllocationPercentage.create(100).value).toBe(100);
    expect(() => AllocationPercentage.create(0)).toThrow(
      InvalidAllocationPercentageError,
    );
    expect(() => AllocationPercentage.create(50.5)).toThrow(
      InvalidAllocationPercentageError,
    );
  });

  it("AllocationNotes optional", () => {
    expect(AllocationNotes.create(null).value).toBeNull();
    expect(AllocationNotes.create("  note  ").value).toBe("note");
  });

  it("AllocationPriorityVO validates enum", () => {
    expect(AllocationPriorityVO.create().value).toBe(PriorityEnum.NORMAL);
    expect(() =>
      AllocationPriorityVO.create("NOPE" as PriorityEnum),
    ).toThrow(AllocationValidationError);
  });

  it("ReservationPeriod requires until > from", () => {
    const from = new Date("2026-01-01T00:00:00Z");
    const until = new Date("2026-01-02T00:00:00Z");
    const p = ReservationPeriod.create(from, until);
    expect(p.from.toISOString()).toBe(from.toISOString());
    expect(() => ReservationPeriod.create(until, from)).toThrow(
      AllocationValidationError,
    );
  });

  it("AllocationName required", () => {
    expect(AllocationName.create("Crew").value).toBe("Crew");
    expect(() => AllocationName.create("")).toThrow(AllocationValidationError);
  });

  it("AllocationReason optional", () => {
    expect(AllocationReason.create(undefined).value).toBeNull();
    expect(AllocationReason.create("need cover").value).toBe("need cover");
  });

  it("value objects are equal by value", () => {
    const a = AllocationPercentage.create(40);
    const b = AllocationPercentage.create(40);
    expect(a.equals(b)).toBe(true);
  });
});
