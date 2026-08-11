import { describe, expect, it, beforeEach } from "vitest";
import { CapabilityLevel } from "../../enums/CapabilityLevel.js";
import { CapacityUnit } from "../../enums/CapacityUnit.js";
import { ResourceType } from "../../enums/ResourceType.js";
import {
  DuplicateCapabilityError,
  OverlappingCapacityProfileError,
} from "../../errors/CapacityErrors.js";
import { CapacityProfileCreated } from "../../events/capacity-events.js";
import { AvailabilityProfileService } from "../../services/AvailabilityProfileService.js";
import { CapabilityService } from "../../services/CapabilityService.js";
import { CapacityProfileService } from "../../services/CapacityProfileService.js";
import { ResourceCapacityService } from "../../services/ResourceCapacityService.js";
import { WorkingPatternService } from "../../services/WorkingPatternService.js";
import { asResourceId } from "../../types/ids.js";
import {
  InMemoryAvailabilityProfileRepository,
  InMemoryCapabilityRepository,
  InMemoryCapacityProfileRepository,
  InMemoryEventPublisher,
  InMemoryOrganizationRepository,
  InMemoryResourceCapacityRepository,
  InMemoryWorkingPatternRepository,
  seedOrganization,
} from "../helpers/in-memory.js";

describe("Capacity services", () => {
  let orgs: InMemoryOrganizationRepository;
  let profiles: InMemoryCapacityProfileRepository;
  let capabilities: InMemoryCapabilityRepository;
  let availability: InMemoryAvailabilityProfileRepository;
  let patterns: InMemoryWorkingPatternRepository;
  let capacities: InMemoryResourceCapacityRepository;
  let events: InMemoryEventPublisher;
  let profileService: CapacityProfileService;
  let capabilityService: CapabilityService;
  let availabilityService: AvailabilityProfileService;
  let patternService: WorkingPatternService;
  let capacityService: ResourceCapacityService;

  beforeEach(() => {
    orgs = new InMemoryOrganizationRepository();
    profiles = new InMemoryCapacityProfileRepository();
    capabilities = new InMemoryCapabilityRepository();
    availability = new InMemoryAvailabilityProfileRepository();
    patterns = new InMemoryWorkingPatternRepository();
    capacities = new InMemoryResourceCapacityRepository();
    events = new InMemoryEventPublisher();

    profileService = new CapacityProfileService({
      capacityProfileRepository: profiles,
      organizationRepository: orgs,
      availabilityProfileRepository: availability,
      workingPatternRepository: patterns,
      eventPublisher: events,
    });
    capabilityService = new CapabilityService({
      capabilityRepository: capabilities,
      capacityProfileRepository: profiles,
      eventPublisher: events,
    });
    availabilityService = new AvailabilityProfileService({
      availabilityProfileRepository: availability,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    patternService = new WorkingPatternService({
      workingPatternRepository: patterns,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    capacityService = new ResourceCapacityService({
      resourceCapacityRepository: capacities,
      capacityProfileRepository: profiles,
      eventPublisher: events,
    });
  });

  it("creates profile with templates and capacity measures", async () => {
    const organization = await seedOrganization(orgs);
    const avail = await availabilityService.create({
      organizationId: organization.id,
      name: "Standard Week",
    });
    const pattern = await patternService.create({
      organizationId: organization.id,
      hoursPerWeek: 40,
      hoursPerDay: 8,
      daysPerWeek: 5,
    });
    const profile = await profileService.create({
      organizationId: organization.id,
      resourceId: asResourceId("worker-ada"),
      resourceType: ResourceType.WORKER,
      availabilityProfileId: avail.id,
      workingPatternId: pattern.id,
    });
    expect(profile.availabilityProfileId).toBe(avail.id);
    expect(events.events.some((e) => e instanceof CapacityProfileCreated)).toBe(
      true,
    );

    const cap = await capabilityService.add({
      organizationId: organization.id,
      capacityProfileId: profile.id,
      name: "Mastering",
      proficiency: CapabilityLevel.EXPERT,
    });
    expect(cap.name.value).toBe("Mastering");

    const measure = await capacityService.define({
      organizationId: organization.id,
      capacityProfileId: profile.id,
      capacityType: "weekly-hours",
      quantity: 40,
      unit: CapacityUnit.HOURS,
    });
    expect(measure.quantity.unit).toBe(CapacityUnit.HOURS);
  });

  it("rejects overlapping active profiles for same resource", async () => {
    const organization = await seedOrganization(orgs);
    const resourceId = asResourceId("studio-a");
    await profileService.create({
      organizationId: organization.id,
      resourceId,
      resourceType: ResourceType.STUDIO,
      effectiveFrom: new Date("2024-01-01"),
    });
    await expect(
      profileService.create({
        organizationId: organization.id,
        resourceId,
        resourceType: ResourceType.STUDIO,
        effectiveFrom: new Date("2024-06-01"),
      }),
    ).rejects.toBeInstanceOf(OverlappingCapacityProfileError);
  });

  it("rejects duplicate capabilities on a profile", async () => {
    const organization = await seedOrganization(orgs);
    const profile = await profileService.create({
      organizationId: organization.id,
      resourceId: asResourceId("w1"),
      resourceType: ResourceType.WORKER,
    });
    await capabilityService.add({
      organizationId: organization.id,
      capacityProfileId: profile.id,
      name: "Mixing",
      proficiency: CapabilityLevel.ADVANCED,
    });
    await expect(
      capabilityService.add({
        organizationId: organization.id,
        capacityProfileId: profile.id,
        name: "mixing",
        proficiency: CapabilityLevel.BEGINNER,
      }),
    ).rejects.toBeInstanceOf(DuplicateCapabilityError);
  });
});
