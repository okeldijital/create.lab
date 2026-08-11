import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { asOrganizationId } from "@creative-lab/organization";
import { AllocationStatus } from "../../enums/AllocationStatus.js";
import { ResourceType } from "../../enums/ResourceType.js";
import { ReservationStatus } from "../../enums/ReservationStatus.js";
import {
  AllocationActivated,
  AllocationArchived,
  AllocationCancelled,
  AllocationCompleted,
  AllocationCreated,
  AllocationGroupArchived,
  AllocationGroupCreated,
  AllocationUpdated,
  ReservationApproved,
  ReservationCancelled,
  ReservationConverted,
  ReservationRequested,
} from "../../events/allocation-events.js";
import {
  asAllocationGroupId,
  asAllocationId,
  asReservationId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");

describe("Domain events", () => {
  it("are frozen and versioned", () => {
    const e = AllocationCreated.create({
      organizationId: orgId,
      allocationId: asAllocationId("a1"),
      resourceId: "r1",
      resourceType: ResourceType.WORKER,
      projectId: "p1",
      workOrderId: "w1",
      status: AllocationStatus.PLANNED,
      percentage: 50,
    });
    expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(Object.isFrozen(e)).toBe(true);
    expect(Object.isFrozen(e.payload)).toBe(true);
  });

  it("covers minimum event set", () => {
    const events = [
      AllocationUpdated.create({
        organizationId: orgId,
        allocationId: asAllocationId("a1"),
      }),
      AllocationActivated.create({
        organizationId: orgId,
        allocationId: asAllocationId("a1"),
      }),
      AllocationCompleted.create({
        organizationId: orgId,
        allocationId: asAllocationId("a1"),
      }),
      AllocationCancelled.create({
        organizationId: orgId,
        allocationId: asAllocationId("a1"),
      }),
      AllocationArchived.create({
        organizationId: orgId,
        allocationId: asAllocationId("a1"),
      }),
      AllocationGroupCreated.create({
        organizationId: orgId,
        groupId: asAllocationGroupId("g1"),
        name: "Crew",
      }),
      AllocationGroupArchived.create({
        organizationId: orgId,
        groupId: asAllocationGroupId("g1"),
      }),
      ReservationRequested.create({
        organizationId: orgId,
        reservationId: asReservationId("r1"),
        resourceId: "res",
        projectId: "p",
        status: ReservationStatus.REQUESTED,
      }),
      ReservationApproved.create({
        organizationId: orgId,
        reservationId: asReservationId("r1"),
      }),
      ReservationCancelled.create({
        organizationId: orgId,
        reservationId: asReservationId("r1"),
      }),
      ReservationConverted.create({
        organizationId: orgId,
        reservationId: asReservationId("r1"),
        allocationId: asAllocationId("a1"),
      }),
    ];
    for (const e of events) {
      expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
      expect(Object.isFrozen(e)).toBe(true);
    }
  });
});
