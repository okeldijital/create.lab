import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { asWorkOrderId } from "@creative-lab/operations";
import { asProjectId } from "@creative-lab/projects";
import { Allocation } from "../../aggregates/Allocation/Allocation.js";
import { AllocationGroup } from "../../aggregates/AllocationGroup/AllocationGroup.js";
import { Reservation } from "../../aggregates/Reservation/Reservation.js";
import { AllocationStatus } from "../../enums/AllocationStatus.js";
import { ResourceType } from "../../enums/ResourceType.js";
import { ReservationStatus } from "../../enums/ReservationStatus.js";
import {
  InvalidAllocationPercentageError,
  InvalidAllocationStateError,
  ReservationLifecycleError,
} from "../../errors/AllocationErrors.js";
import {
  AllocationActivated,
  AllocationArchived,
  AllocationCreated,
  AllocationGroupCreated,
  ReservationConverted,
  ReservationRequested,
} from "../../events/allocation-events.js";
import { asAllocationId } from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const workOrderId = asWorkOrderId("wo-1");
const start = new Date("2026-08-01T09:00:00Z");
const end = new Date("2026-08-01T17:00:00Z");

function createAllocation(
  overrides: Partial<Parameters<typeof Allocation.create>[0]> = {},
) {
  return Allocation.create({
    organizationId: orgId,
    projectId,
    workOrderId,
    resourceId: "worker-1",
    resourceType: ResourceType.WORKER,
    allocationPercentage: 50,
    startDate: start,
    endDate: end,
    ...overrides,
  });
}

describe("Allocation aggregate", () => {
  it("creates PLANNED with event", () => {
    const a = createAllocation();
    expect(a.status).toBe(AllocationStatus.PLANNED);
    expect(a.allocationPercentage.value).toBe(50);
    expect(a.pullDomainEvents()[0]).toBeInstanceOf(AllocationCreated);
  });

  it("activates, completes, archives", () => {
    const a = createAllocation();
    a.pullDomainEvents();
    a.activate();
    expect(a.status).toBe(AllocationStatus.ACTIVE);
    expect(a.pullDomainEvents()[0]).toBeInstanceOf(AllocationActivated);
    a.complete();
    a.archive();
    expect(a.status).toBe(AllocationStatus.ARCHIVED);
    expect(a.pullDomainEvents().some((e) => e instanceof AllocationArchived)).toBe(
      true,
    );
  });

  it("archived is immutable", () => {
    const a = createAllocation();
    a.activate();
    a.complete();
    a.archive();
    expect(() => a.activate()).toThrow(InvalidAllocationStateError);
    expect(() => a.update({ notes: "x" })).toThrow(InvalidAllocationStateError);
  });

  it("validates percentage 1–100", () => {
    expect(() => createAllocation({ allocationPercentage: 0 })).toThrow(
      InvalidAllocationPercentageError,
    );
    expect(() => createAllocation({ allocationPercentage: 101 })).toThrow(
      InvalidAllocationPercentageError,
    );
  });

  it("requires end after start", () => {
    expect(() =>
      createAllocation({ startDate: end, endDate: start }),
    ).toThrow(InvalidAllocationStateError);
  });

  it("cancels from planned", () => {
    const a = createAllocation();
    a.cancel();
    expect(a.status).toBe(AllocationStatus.CANCELLED);
  });

  it("reconstitutes snapshot", () => {
    const a = createAllocation();
    const r = Allocation.reconstitute(a.toSnapshot());
    expect(r.id).toBe(a.id);
    expect(r.resourceType).toBe(ResourceType.WORKER);
  });
});

describe("AllocationGroup aggregate", () => {
  it("creates group and manages members", () => {
    const g = AllocationGroup.create({
      organizationId: orgId,
      name: "Album Production",
      description: "Crew",
    });
    expect(g.pullDomainEvents()[0]).toBeInstanceOf(AllocationGroupCreated);
    const aid = asAllocationId("alloc-1");
    g.addAllocation(aid);
    expect(g.contains(aid)).toBe(true);
    g.removeAllocation(aid);
    expect(g.contains(aid)).toBe(false);
  });

  it("archived group immutable", () => {
    const g = AllocationGroup.create({
      organizationId: orgId,
      name: "Website Launch",
    });
    g.archive();
    expect(() => g.rename("X")).toThrow(InvalidAllocationStateError);
  });
});

describe("Reservation aggregate", () => {
  it("lifecycle REQUESTED → APPROVED → CONVERTED", () => {
    const r = Reservation.create({
      organizationId: orgId,
      resourceId: "studio-1",
      projectId,
      requestedBy: "user-1",
      reservedFrom: start,
      reservedUntil: end,
    });
    expect(r.status).toBe(ReservationStatus.REQUESTED);
    expect(r.pullDomainEvents()[0]).toBeInstanceOf(ReservationRequested);
    r.approve();
    expect(r.status).toBe(ReservationStatus.APPROVED);
    r.pullDomainEvents();
    r.convert(asAllocationId("a1"));
    expect(r.status).toBe(ReservationStatus.CONVERTED);
    expect(r.pullDomainEvents()[0]).toBeInstanceOf(ReservationConverted);
  });

  it("cannot convert from REQUESTED", () => {
    const r = Reservation.create({
      organizationId: orgId,
      resourceId: "studio-1",
      projectId,
      requestedBy: "user-1",
      reservedFrom: start,
      reservedUntil: end,
    });
    expect(() => r.convert(asAllocationId("a1"))).toThrow(
      ReservationLifecycleError,
    );
  });

  it("cancel from requested", () => {
    const r = Reservation.create({
      organizationId: orgId,
      resourceId: "eq-1",
      projectId,
      requestedBy: "u1",
      reservedFrom: start,
      reservedUntil: end,
    });
    r.cancel();
    expect(r.status).toBe(ReservationStatus.CANCELLED);
  });
});
