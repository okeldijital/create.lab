import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { TimeBlock } from "../../aggregates/TimeBlock/TimeBlock.js";
import { TimeBlockType } from "../../enums/TimeBlockType.js";
import { TimeBlockOverlapError } from "../../errors/SchedulingErrors.js";
import { TimeBlockPolicy } from "../../policies/TimeBlockPolicy.js";
import { asScheduleId } from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const scheduleId = asScheduleId("s1");

describe("TimeBlockPolicy", () => {
  it("rejects overlapping open blocks", () => {
    const existing = [
      TimeBlock.create({
        organizationId: orgId,
        scheduleId,
        start: new Date("2024-01-01T09:00:00Z"),
        end: new Date("2024-01-01T12:00:00Z"),
        type: TimeBlockType.BOOKABLE,
      }),
    ];
    expect(() =>
      TimeBlockPolicy.assertNoOverlap(existing, {
        start: new Date("2024-01-01T11:00:00Z"),
        end: new Date("2024-01-01T13:00:00Z"),
      }),
    ).toThrow(TimeBlockOverlapError);
  });

  it("allows adjacent blocks", () => {
    const existing = [
      TimeBlock.create({
        organizationId: orgId,
        scheduleId,
        start: new Date("2024-01-01T09:00:00Z"),
        end: new Date("2024-01-01T12:00:00Z"),
        type: TimeBlockType.BOOKABLE,
      }),
    ];
    expect(() =>
      TimeBlockPolicy.assertNoOverlap(existing, {
        start: new Date("2024-01-01T12:00:00Z"),
        end: new Date("2024-01-01T14:00:00Z"),
      }),
    ).not.toThrow();
  });
});
