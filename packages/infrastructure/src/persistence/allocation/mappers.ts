import {
  Allocation,
  AllocationGroup,
  Reservation,
  asAllocationGroupId,
  asAllocationId,
  asReservationId,
  type AllocationGroupSnapshot,
  type AllocationSnapshot,
  type ReservationSnapshot,
} from "@creative-lab/allocation";
import { asWorkOrderId } from "@creative-lab/operations";
import { asProjectId } from "@creative-lab/projects";
import type { InferSelectModel } from "drizzle-orm";
import type { allocationGroups, allocations, reservations } from "./schema.js";

type AllocationRow = InferSelectModel<typeof allocations>;
type AllocationGroupRow = InferSelectModel<typeof allocationGroups>;
type ReservationRow = InferSelectModel<typeof reservations>;

export const AllocationMapper = {
  toRow(allocation: Allocation): AllocationRow {
    const s = allocation.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      projectId: s.projectId,
      workOrderId: s.workOrderId,
      resourceId: s.resourceId,
      resourceType: s.resourceType,
      status: s.status,
      allocationPercentage: s.allocationPercentage,
      startDate: s.startDate,
      endDate: s.endDate,
      priority: s.priority,
      notes: s.notes,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: AllocationRow): Allocation {
    const snapshot: AllocationSnapshot = {
      id: asAllocationId(row.id),
      organizationId: row.organizationId as AllocationSnapshot["organizationId"],
      projectId: asProjectId(row.projectId),
      workOrderId: asWorkOrderId(row.workOrderId),
      resourceId: row.resourceId,
      resourceType: row.resourceType as AllocationSnapshot["resourceType"],
      status: row.status as AllocationSnapshot["status"],
      allocationPercentage: row.allocationPercentage,
      startDate: new Date(row.startDate),
      endDate: new Date(row.endDate),
      priority: row.priority as AllocationSnapshot["priority"],
      notes: row.notes ?? null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return Allocation.reconstitute(snapshot);
  },
};

export const AllocationGroupMapper = {
  toRow(group: AllocationGroup): AllocationGroupRow {
    const s = group.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      name: s.name,
      description: s.description,
      allocationIds: s.allocationIds as string[],
      archived: s.archived,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: AllocationGroupRow): AllocationGroup {
    const snapshot: AllocationGroupSnapshot = {
      id: asAllocationGroupId(row.id),
      organizationId: row.organizationId as AllocationGroupSnapshot["organizationId"],
      name: row.name,
      description: row.description ?? null,
      allocationIds: (row.allocationIds ?? []).map((value) => asAllocationId(value) as string),
      archived: row.archived,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return AllocationGroup.reconstitute(snapshot);
  },
};

export const ReservationMapper = {
  toRow(reservation: Reservation): ReservationRow {
    const s = reservation.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      resourceId: s.resourceId,
      projectId: s.projectId,
      requestedBy: s.requestedBy,
      reservedFrom: s.reservedFrom,
      reservedUntil: s.reservedUntil,
      status: s.status,
      convertedAllocationId: s.convertedAllocationId,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: ReservationRow): Reservation {
    const snapshot: ReservationSnapshot = {
      id: asReservationId(row.id),
      organizationId: row.organizationId as ReservationSnapshot["organizationId"],
      resourceId: row.resourceId,
      projectId: asProjectId(row.projectId),
      requestedBy: row.requestedBy,
      reservedFrom: new Date(row.reservedFrom),
      reservedUntil: new Date(row.reservedUntil),
      status: row.status as ReservationSnapshot["status"],
      convertedAllocationId: row.convertedAllocationId
        ? asAllocationId(row.convertedAllocationId)
        : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return Reservation.reconstitute(snapshot);
  },
};
