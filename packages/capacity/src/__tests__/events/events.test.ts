import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { CapacityStatus } from "../../enums/CapacityStatus.js";
import { ResourceType } from "../../enums/ResourceType.js";
import { CapacityProfileCreated } from "../../events/capacity-events.js";
import {
  asCapacityProfileId,
  asResourceId,
} from "../../types/ids.js";

describe("Capacity domain events", () => {
  it("are frozen and versioned", () => {
    const event = CapacityProfileCreated.create({
      organizationId: "org-1",
      capacityProfileId: asCapacityProfileId("cp-1"),
      resourceId: asResourceId("w1"),
      resourceType: ResourceType.WORKER,
      status: CapacityStatus.ACTIVE,
    });
    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.payload)).toBe(true);
    expect(event.eventVersion).toBe(DOMAIN_EVENT_VERSION);
  });
});
