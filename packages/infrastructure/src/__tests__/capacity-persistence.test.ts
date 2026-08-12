import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  AvailabilityProfile,
  Capability,
  CapacityProfile,
  ResourceCapacity,
  WorkingPattern,
  CapacityUnit,
  CapabilityLevel,
  ResourceType,
} from "@creative-lab/capacity";
import type { OrganizationId } from "@creative-lab/organization";
import {
  AvailabilityProfileMapper,
  CapabilityMapper,
  CapacityProfileMapper,
  ResourceCapacityMapper,
  WorkingPatternMapper,
} from "../persistence/capacity/mappers.js";

const id = (): string => randomUUID();
const organizationId = id() as OrganizationId;
const now = new Date("2026-01-01T00:00:00.000Z");

const availabilityProfile = AvailabilityProfile.create({
  id: id(),
  organizationId,
  name: "Standard availability",
  timezone: "Africa/Johannesburg",
  now,
});

const workingPattern = WorkingPattern.create({
  id: id(),
  organizationId,
  hoursPerWeek: 40,
  hoursPerDay: 8,
  daysPerWeek: 5,
  overtimeAllowed: true,
  remoteAllowed: true,
  now,
});

const capacityProfile = CapacityProfile.create({
  id: id(),
  organizationId,
  resourceId: id() as never,
  resourceType: ResourceType.WORKER,
  availabilityProfileId: availabilityProfile.id,
  workingPatternId: workingPattern.id,
  now,
});

const capability = Capability.create({
  id: id(),
  organizationId,
  capacityProfileId: capacityProfile.id,
  name: "Audio Production",
  proficiency: CapabilityLevel.EXPERT,
  certification: "Internal",
  now,
});

const resourceCapacity = ResourceCapacity.create({
  id: id(),
  organizationId,
  capacityProfileId: capacityProfile.id,
  capacityType: "Production Hours",
  quantity: 40,
  unit: CapacityUnit.HOURS,
  now,
});

describe("Capacity persistence mappers", () => {
  it("round-trips CapacityProfile", () => {
    const restored = CapacityProfileMapper.fromRow(CapacityProfileMapper.toRow(capacityProfile));
    expect(restored.toSnapshot()).toEqual(capacityProfile.toSnapshot());
  });

  it("round-trips Capability", () => {
    const restored = CapabilityMapper.fromRow(CapabilityMapper.toRow(capability));
    expect(restored.toSnapshot()).toEqual(capability.toSnapshot());
  });

  it("round-trips AvailabilityProfile", () => {
    const restored = AvailabilityProfileMapper.fromRow(AvailabilityProfileMapper.toRow(availabilityProfile));
    expect(restored.toSnapshot()).toEqual(availabilityProfile.toSnapshot());
  });

  it("round-trips WorkingPattern", () => {
    const restored = WorkingPatternMapper.fromRow(WorkingPatternMapper.toRow(workingPattern));
    expect(restored.toSnapshot()).toEqual(workingPattern.toSnapshot());
  });

  it("round-trips ResourceCapacity", () => {
    const restored = ResourceCapacityMapper.fromRow(ResourceCapacityMapper.toRow(resourceCapacity));
    expect(restored.toSnapshot()).toEqual(resourceCapacity.toSnapshot());
  });
});
