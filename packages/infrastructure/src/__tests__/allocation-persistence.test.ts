import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  Allocation,
  AllocationGroup,
  AllocationPriority,
  Reservation,
  ResourceType,
  asAllocationId,
} from "@creative-lab/allocation";
import type { OrganizationId } from "@creative-lab/organization";
import { asWorkOrderId } from "@creative-lab/operations";
import { asProjectId } from "@creative-lab/projects";
import {
  AllocationGroupMapper,
  AllocationMapper,
  ReservationMapper,
} from "../persistence/allocation/mappers.js";

const id = (): string => randomUUID();
const organizationId = id() as OrganizationId;
const now = new Date("2026-01-01T08:00:00.000Z");
const end = new Date("2026-01-15T17:00:00.000Z");

const allocation = Allocation.create({
  id: id(),
  organizationId,
  projectId: asProjectId(id()),
  workOrderId: asWorkOrderId(id()),
  resourceId: id(),
  resourceType: ResourceType.WORKER,
  allocationPercentage: 50,
  startDate: now,
  endDate: end,
  priority: AllocationPriority.HIGH,
  notes: "Primary producer",
  now,
});

const group = AllocationGroup.create({
  id: id(),
  organizationId,
  name: "Q1 Brand Crew",
  description: "Core production group",
  allocationIds: [allocation.id, asAllocationId(id())],
  now,
});

const reservation = Reservation.create({
  id: id(),
  organizationId,
  resourceId: id(),
  projectId: asProjectId(id()),
  requestedBy: "planner-1",
  reservedFrom: now,
  reservedUntil: end,
  now,
});

describe("Allocation persistence mappers", () => {
  it("round-trips Allocation including percentage, enums, and notes", () => {
    const restored = AllocationMapper.fromRow(AllocationMapper.toRow(allocation));
    expect(restored.toSnapshot()).toEqual(allocation.toSnapshot());
    expect(restored.allocationPercentage.value).toBe(50);
    expect(restored.notes.value).toBe("Primary producer");
  });

  it("round-trips Allocation with null notes", () => {
    const plain = Allocation.create({
      id: id(),
      organizationId,
      projectId: asProjectId(id()),
      workOrderId: asWorkOrderId(id()),
      resourceId: id(),
      resourceType: ResourceType.STUDIO,
      allocationPercentage: 100,
      startDate: now,
      endDate: end,
      now,
    });
    const restored = AllocationMapper.fromRow(AllocationMapper.toRow(plain));
    expect(restored.toSnapshot()).toEqual(plain.toSnapshot());
    expect(restored.notes.value).toBeNull();
  });

  it("round-trips archived Allocation status", () => {
    allocation.archive(now);
    const restored = AllocationMapper.fromRow(AllocationMapper.toRow(allocation));
    expect(restored.toSnapshot()).toEqual(allocation.toSnapshot());
    expect(restored.isArchived).toBe(true);
  });

  it("round-trips AllocationGroup membership and archived flag", () => {
    const restored = AllocationGroupMapper.fromRow(AllocationGroupMapper.toRow(group));
    expect(restored.toSnapshot()).toEqual(group.toSnapshot());
    expect(restored.allocationIds).toHaveLength(2);
    expect(restored.archived).toBe(false);
    group.archive(now);
    const archived = AllocationGroupMapper.fromRow(AllocationGroupMapper.toRow(group));
    expect(archived.archived).toBe(true);
  });

  it("round-trips Reservation with nullable convertedAllocationId", () => {
    const restored = ReservationMapper.fromRow(ReservationMapper.toRow(reservation));
    expect(restored.toSnapshot()).toEqual(reservation.toSnapshot());
    expect(restored.convertedAllocationId).toBeNull();

    reservation.approve(now);
    const allocationId = asAllocationId(id());
    reservation.convert(allocationId, now);
    const converted = ReservationMapper.fromRow(ReservationMapper.toRow(reservation));
    expect(converted.toSnapshot()).toEqual(reservation.toSnapshot());
    expect(converted.convertedAllocationId).toBe(allocationId);
    expect(converted.status).toBe("CONVERTED");
  });
});
