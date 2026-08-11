import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { CapacityProfile } from "../../aggregates/CapacityProfile/CapacityProfile.js";
import { ResourceType } from "../../enums/ResourceType.js";
import {
  DuplicateCapabilityError,
  OverlappingCapacityProfileError,
} from "../../errors/CapacityErrors.js";
import {
  CapabilityAssignmentPolicy,
  CapacityLifecyclePolicy,
} from "../../policies/index.js";
import { asResourceId } from "../../types/ids.js";
import { Capability } from "../../aggregates/Capability/Capability.js";
import { CapabilityLevel } from "../../enums/CapabilityLevel.js";

const orgId = asOrganizationId("org-1");
const resourceId = asResourceId("w1");

describe("Capacity policies", () => {
  it("rejects overlapping active profiles", () => {
    const existing = CapacityProfile.create({
      organizationId: orgId,
      resourceId,
      resourceType: ResourceType.WORKER,
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: new Date("2024-12-31"),
    });
    expect(() =>
      CapacityLifecyclePolicy.assertCanCreateActive([existing], {
        resourceId,
        effectiveFrom: new Date("2024-06-01"),
        effectiveTo: null,
      }),
    ).toThrow(OverlappingCapacityProfileError);
  });

  it("allows non-overlapping periods", () => {
    const existing = CapacityProfile.create({
      organizationId: orgId,
      resourceId,
      resourceType: ResourceType.WORKER,
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: new Date("2024-06-30"),
    });
    expect(() =>
      CapacityLifecyclePolicy.assertCanCreateActive([existing], {
        resourceId,
        effectiveFrom: new Date("2024-07-01"),
        effectiveTo: null,
      }),
    ).not.toThrow();
  });

  it("rejects duplicate capability names", () => {
    const profile = CapacityProfile.create({
      organizationId: orgId,
      resourceId,
      resourceType: ResourceType.WORKER,
    });
    const existing = [
      Capability.create({
        organizationId: orgId,
        capacityProfileId: profile.id,
        name: "Mixing",
        proficiency: CapabilityLevel.EXPERT,
      }),
    ];
    expect(() =>
      CapabilityAssignmentPolicy.assertCanAdd(profile, existing, "mixing"),
    ).toThrow(DuplicateCapabilityError);
  });
});
