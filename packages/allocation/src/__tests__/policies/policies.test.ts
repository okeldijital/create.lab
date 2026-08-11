import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { asWorkOrderId } from "@creative-lab/operations";
import { asProjectId } from "@creative-lab/projects";
import { Allocation } from "../../aggregates/Allocation/Allocation.js";
import { AllocationGroup } from "../../aggregates/AllocationGroup/AllocationGroup.js";
import { Reservation } from "../../aggregates/Reservation/Reservation.js";
import { ResourceType } from "../../enums/ResourceType.js";
import {
  AllocationConflictError,
  DuplicateAllocationError,
  DuplicateAllocationGroupError,
  ReservationLifecycleError,
} from "../../errors/AllocationErrors.js";
import {
  AllocationConflictPolicy,
  AllocationGroupPolicy,
  AllocationPolicy,
  ReservationPolicy,
} from "../../policies/index.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const workOrderId = asWorkOrderId("wo-1");
const start = new Date("2026-08-01T09:00:00Z");
const end = new Date("2026-08-01T17:00:00Z");

function alloc(resourceId: string, s = start, e = end, wo = workOrderId) {
  return Allocation.create({
    organizationId: orgId,
    projectId,
    workOrderId: wo,
    resourceId,
    resourceType: ResourceType.WORKER,
    allocationPercentage: 100,
    startDate: s,
    endDate: e,
  });
}

describe("AllocationPolicy", () => {
  it("validates percentage and date order", () => {
    expect(() => AllocationPolicy.assertPercentage(50)).not.toThrow();
    expect(() => AllocationPolicy.assertPercentage(0)).toThrow();
    expect(() => AllocationPolicy.assertDateOrder(end, start)).toThrow();
  });

  it("blocks updates on archived", () => {
    const a = alloc("w1");
    a.activate();
    a.complete();
    a.archive();
    expect(() => AllocationPolicy.assertMutable(a)).toThrow();
  });
});

describe("AllocationConflictPolicy", () => {
  it("detects duplicate active resource+workOrder", () => {
    const a = alloc("w1");
    a.activate();
    expect(() =>
      AllocationConflictPolicy.assertNoDuplicateActive(
        [a],
        "w1",
        workOrderId,
      ),
    ).toThrow(DuplicateAllocationError);
  });

  it("detects overlapping commitments on same resource", () => {
    const a = alloc("w1");
    a.activate();
    expect(() =>
      AllocationConflictPolicy.assertNoOverlap(
        [a],
        "w1",
        new Date("2026-08-01T12:00:00Z"),
        new Date("2026-08-01T20:00:00Z"),
      ),
    ).toThrow(AllocationConflictError);
  });

  it("allows adjacent non-overlapping ranges", () => {
    const a = alloc(
      "w1",
      start,
      end,
    );
    a.activate();
    expect(() =>
      AllocationConflictPolicy.assertNoOverlap(
        [a],
        "w1",
        end,
        new Date("2026-08-01T20:00:00Z"),
      ),
    ).not.toThrow();
  });
});

describe("ReservationPolicy", () => {
  it("enforces lifecycle", () => {
    const r = Reservation.create({
      organizationId: orgId,
      resourceId: "w1",
      projectId,
      requestedBy: "u1",
      reservedFrom: start,
      reservedUntil: end,
    });
    expect(() => ReservationPolicy.assertCanConvert(r)).toThrow(
      ReservationLifecycleError,
    );
    ReservationPolicy.assertCanApprove(r);
    r.approve();
    ReservationPolicy.assertCanConvert(r);
  });
});

describe("AllocationGroupPolicy", () => {
  it("enforces unique names", () => {
    const g = AllocationGroup.create({
      organizationId: orgId,
      name: "Film Shoot",
    });
    expect(() =>
      AllocationGroupPolicy.assertUniqueName([g], "film shoot", orgId),
    ).toThrow(DuplicateAllocationGroupError);
  });
});
