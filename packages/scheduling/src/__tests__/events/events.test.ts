import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { ScheduleStatus } from "../../enums/ScheduleStatus.js";
import { ScheduleCreated } from "../../events/scheduling-events.js";
import { asCalendarId, asScheduleId } from "../../types/ids.js";

describe("Scheduling domain events", () => {
  it("are frozen and versioned", () => {
    const event = ScheduleCreated.create({
      organizationId: "org-1",
      scheduleId: asScheduleId("s1"),
      name: "Prod",
      calendarId: asCalendarId("c1"),
      status: ScheduleStatus.ACTIVE,
    });
    expect(Object.isFrozen(event)).toBe(true);
    expect(event.eventVersion).toBe(DOMAIN_EVENT_VERSION);
  });
});
