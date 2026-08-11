import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { asWorkOrderId } from "@creative-lab/operations";
import { asProjectId } from "@creative-lab/projects";
import { Allocation } from "../../aggregates/Allocation/Allocation.js";
import { AllocationGroup } from "../../aggregates/AllocationGroup/AllocationGroup.js";
import { Reservation } from "../../aggregates/Reservation/Reservation.js";
import { ResourceType } from "../../enums/ResourceType.js";
import {
  InMemoryAllocationGroupRepository,
  InMemoryAllocationRepository,
  InMemoryReservationRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const workOrderId = asWorkOrderId("wo-1");
const start = new Date("2026-08-01T09:00:00Z");
const end = new Date("2026-08-01T17:00:00Z");

describe("Repository contracts", () => {
  it("AllocationRepository ports", async () => {
    const repo = new InMemoryAllocationRepository();
    const a = Allocation.create({
      organizationId: orgId,
      projectId,
      workOrderId,
      resourceId: "r1",
      resourceType: ResourceType.WORKER,
      allocationPercentage: 50,
      startDate: start,
      endDate: end,
    });
    await repo.save(a);
    expect(await repo.exists(a.id)).toBe(true);
    expect((await repo.findByProject(projectId))[0]?.id).toBe(a.id);
    expect((await repo.findByWorkOrder(workOrderId))[0]?.id).toBe(a.id);
    expect((await repo.findByResource("r1"))[0]?.id).toBe(a.id);
    expect((await repo.findActive()).length).toBe(1);
    await repo.archive(a.id);
    expect(await repo.findById(a.id)).toBeNull();
  });

  it("AllocationGroupRepository ports", async () => {
    const repo = new InMemoryAllocationGroupRepository();
    const g = AllocationGroup.create({
      organizationId: orgId,
      name: "Group",
    });
    await repo.save(g);
    expect((await repo.findByOrganization(orgId)).length).toBe(1);
    await repo.archive(g.id);
    expect(await repo.findById(g.id)).toBeNull();
  });

  it("ReservationRepository ports", async () => {
    const repo = new InMemoryReservationRepository();
    const r = Reservation.create({
      organizationId: orgId,
      resourceId: "r1",
      projectId,
      requestedBy: "u1",
      reservedFrom: start,
      reservedUntil: end,
    });
    await repo.save(r);
    expect((await repo.findByResource("r1")).length).toBe(1);
    await repo.cancel(r.id);
    await repo.convert(r.id);
    expect(await repo.exists(r.id)).toBe(true);
  });
});
