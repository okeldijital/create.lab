import { describe, expect, it } from "vitest";
import type { OrganizationId } from "@creative-lab/organization";
import { CapabilityLevel, CapacityUnit, ResourceType, AvailabilityProfile, Capability, CapacityProfile, ResourceCapacity, WorkingPattern, asAvailabilityProfileId, asCapacityProfileId, asWorkingPatternId, asResourceId } from "@creative-lab/capacity";
import { AvailabilityProfileMapper, CapabilityMapper, CapacityProfileMapper, ResourceCapacityMapper, WorkingPatternMapper } from "../persistence/capacity/mappers.js";

const organizationId = "00000000-0000-0000-0000-000000000001" as OrganizationId;
const now = new Date("2026-01-01T00:00:00.000Z");

describe("Capacity persistence mappers", () => {
  it("round-trips CapacityProfile", () => {
    const value = CapacityProfile.create({ organizationId, resourceId: asResourceId("00000000-0000-0000-0000-000000000010"), resourceType: ResourceType.WORKER, availabilityProfileId: asAvailabilityProfileId("00000000-0000-0000-0000-000000000011"), workingPatternId: asWorkingPatternId("00000000-0000-0000-0000-000000000012"), now });
    const result = CapacityProfileMapper.fromRow(CapacityProfileMapper.toRow(value));
    expect(result.toSnapshot()).toEqual(value.toSnapshot());
  });

  it("round-trips Capability", () => {
    const value = Capability.create({ organizationId, capacityProfileId: asCapacityProfileId("00000000-0000-0000-0000-000000000020"), name: "Mixing", proficiency: CapabilityLevel.EXPERT, certification: "CERT", now });
    const result = CapabilityMapper.fromRow(CapabilityMapper.toRow(value));
    expect(result.toSnapshot()).toEqual(value.toSnapshot());
  });

  it("round-trips AvailabilityProfile", () => {
    const value = AvailabilityProfile.create({ organizationId, name: "Standard", timezone: "UTC", now });
    const result = AvailabilityProfileMapper.fromRow(AvailabilityProfileMapper.toRow(value));
    expect(result.toSnapshot()).toEqual(value.toSnapshot());
  });

  it("round-trips WorkingPattern", () => {
    const value = WorkingPattern.create({ organizationId, hoursPerWeek: 40, hoursPerDay: 8, daysPerWeek: 5, overtimeAllowed: true, remoteAllowed: true, now });
    const result = WorkingPatternMapper.fromRow(WorkingPatternMapper.toRow(value));
    expect(result.toSnapshot()).toEqual(value.toSnapshot());
  });

  it("round-trips ResourceCapacity", () => {
    const value = ResourceCapacity.create({ organizationId, capacityProfileId: asCapacityProfileId("00000000-0000-0000-0000-000000000030"), capacityType: "production", quantity: 40, unit: CapacityUnit.HOURS, now });
    const result = ResourceCapacityMapper.fromRow(ResourceCapacityMapper.toRow(value));
    expect(result.toSnapshot()).toEqual(value.toSnapshot());
  });
});
