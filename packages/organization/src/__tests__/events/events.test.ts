import { describe, expect, it } from "vitest";
import {
  DOMAIN_EVENT_VERSION,
  OrganizationCreated,
  OrganizationSettingsUpdated,
} from "../../events/index.js";
import { OrganizationStatus } from "../../enums/OrganizationStatus.js";
import { asOrganizationId } from "../../types/ids.js";

describe("Domain events", () => {
  it("are immutable and versioned", () => {
    const event = OrganizationCreated.create({
      organizationId: asOrganizationId("org-1"),
      name: "Acme",
      displayName: "Acme",
      slug: "acme",
      status: OrganizationStatus.ACTIVE,
    });

    expect(event.eventType).toBe("OrganizationCreated");
    expect(event.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(event.aggregateId).toBe("org-1");
    expect(event.organizationId).toBe("org-1");
    expect(event.eventId).toBeTruthy();
    expect(event.occurredAt).toBeInstanceOf(Date);
    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.payload)).toBe(true);
  });

  it("settings event carries operational payload", () => {
    const event = OrganizationSettingsUpdated.create({
      organizationId: asOrganizationId("org-1"),
      timezone: "UTC",
      locale: "en-US",
      currency: "USD",
      workingWeek: ["MONDAY"],
      workingHours: { start: "09:00", end: "17:00" },
    });
    expect(event.payload.workingHours.start).toBe("09:00");
  });
});
