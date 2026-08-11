import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { AvailabilityProfile } from "../../aggregates/AvailabilityProfile/AvailabilityProfile.js";
import { Capability } from "../../aggregates/Capability/Capability.js";
import { CapacityProfile } from "../../aggregates/CapacityProfile/CapacityProfile.js";
import { ResourceCapacity } from "../../aggregates/ResourceCapacity/ResourceCapacity.js";
import { WorkingPattern } from "../../aggregates/WorkingPattern/WorkingPattern.js";
import { CapabilityLevel } from "../../enums/CapabilityLevel.js";
import { CapacityStatus } from "../../enums/CapacityStatus.js";
import { CapacityUnit } from "../../enums/CapacityUnit.js";
import { ResourceType } from "../../enums/ResourceType.js";
import {
  CapacityProfileValidationError,
  InvalidWorkingPatternError,
} from "../../errors/CapacityErrors.js";
import {
  CapacityProfileCreated,
  CapabilityAdded,
  WorkingPatternCreated,
} from "../../events/capacity-events.js";
import {
  asCapacityProfileId,
  asResourceId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const resourceId = asResourceId("worker-1");

describe("Capacity aggregates", () => {
  it("creates CapacityProfile ACTIVE with event", () => {
    const profile = CapacityProfile.create({
      organizationId: orgId,
      resourceId,
      resourceType: ResourceType.WORKER,
    });
    expect(profile.status).toBe(CapacityStatus.ACTIVE);
    expect(profile.pullDomainEvents()[0]).toBeInstanceOf(
      CapacityProfileCreated,
    );
  });

  it("archives CapacityProfile and blocks updates", () => {
    const profile = CapacityProfile.create({
      organizationId: orgId,
      resourceId,
      resourceType: ResourceType.STUDIO,
    });
    profile.pullDomainEvents();
    profile.archive();
    expect(profile.isArchived).toBe(true);
    expect(() => profile.update({ status: CapacityStatus.ACTIVE })).toThrow(
      CapacityProfileValidationError,
    );
  });

  it("creates Capability and removes it", () => {
    const capability = Capability.create({
      organizationId: orgId,
      capacityProfileId: asCapacityProfileId("cp-1"),
      name: "Mastering",
      proficiency: CapabilityLevel.ADVANCED,
    });
    expect(capability.pullDomainEvents()[0]).toBeInstanceOf(CapabilityAdded);
    capability.pullDomainEvents();
    capability.remove();
    expect(capability.active).toBe(false);
  });

  it("creates AvailabilityProfile template", () => {
    const profile = AvailabilityProfile.create({
      organizationId: orgId,
      name: "Weekdays",
      timezone: "Europe/London",
    });
    expect(profile.workingHours.start).toBe("09:00");
    expect(profile.timezone.value).toBe("Europe/London");
  });

  it("creates WorkingPattern and validates consistency", () => {
    const pattern = WorkingPattern.create({
      organizationId: orgId,
      hoursPerWeek: 40,
      hoursPerDay: 8,
      daysPerWeek: 5,
    });
    expect(pattern.pullDomainEvents()[0]).toBeInstanceOf(WorkingPatternCreated);
    expect(() =>
      WorkingPattern.create({
        organizationId: orgId,
        hoursPerWeek: 50,
        hoursPerDay: 8,
        daysPerWeek: 5,
      }),
    ).toThrow(InvalidWorkingPatternError);
  });

  it("creates ResourceCapacity with positive quantity", () => {
    const capacity = ResourceCapacity.create({
      organizationId: orgId,
      capacityProfileId: asCapacityProfileId("cp-1"),
      capacityType: "weekly-hours",
      quantity: 40,
      unit: CapacityUnit.HOURS,
    });
    expect(capacity.quantity.quantity).toBe(40);
  });
});
