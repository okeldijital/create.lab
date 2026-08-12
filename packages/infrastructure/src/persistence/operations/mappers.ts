import {
  WorkIncident,
  WorkMilestone,
  WorkOrder,
  WorkOutput,
  WorkSession,
  asAllocationId,
  asWorkIncidentId,
  asWorkMilestoneId,
  asWorkOrderId,
  asWorkOutputId,
  asWorkSessionId,
  type WorkIncidentSnapshot,
  type WorkMilestoneSnapshot,
  type WorkOrderSnapshot,
  type WorkOutputSnapshot,
  type WorkSessionSnapshot,
} from "@creative-lab/operations";
import { asBookingId } from "@creative-lab/scheduling";
import type { InferSelectModel } from "drizzle-orm";
import type {
  workIncidents,
  workMilestones,
  workOrders,
  workOutputs,
  workSessions,
} from "./schema.js";

type WorkOrderRow = InferSelectModel<typeof workOrders>;
type WorkSessionRow = InferSelectModel<typeof workSessions>;
type WorkMilestoneRow = InferSelectModel<typeof workMilestones>;
type WorkOutputRow = InferSelectModel<typeof workOutputs>;
type WorkIncidentRow = InferSelectModel<typeof workIncidents>;

export const WorkOrderMapper = {
  toRow(order: WorkOrder): WorkOrderRow {
    const s = order.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      allocationId: s.allocationId,
      bookingId: s.bookingId,
      title: s.title,
      description: s.description,
      priority: s.priority,
      status: s.status,
      plannedStart: s.plannedStart,
      plannedEnd: s.plannedEnd,
      actualStart: s.actualStart,
      actualEnd: s.actualEnd,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      closedAt: s.closedAt,
    };
  },
  fromRow(row: WorkOrderRow): WorkOrder {
    const snapshot: WorkOrderSnapshot = {
      id: asWorkOrderId(row.id),
      organizationId: row.organizationId as WorkOrderSnapshot["organizationId"],
      allocationId: asAllocationId(row.allocationId),
      bookingId: asBookingId(row.bookingId),
      title: row.title,
      description: row.description ?? null,
      priority: row.priority as WorkOrderSnapshot["priority"],
      status: row.status as WorkOrderSnapshot["status"],
      plannedStart: new Date(row.plannedStart),
      plannedEnd: new Date(row.plannedEnd),
      actualStart: row.actualStart ? new Date(row.actualStart) : null,
      actualEnd: row.actualEnd ? new Date(row.actualEnd) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      closedAt: row.closedAt ? new Date(row.closedAt) : null,
    };
    return WorkOrder.reconstitute(snapshot);
  },
};

export const WorkSessionMapper = {
  toRow(session: WorkSession): WorkSessionRow {
    const s = session.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      workOrderId: s.workOrderId,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      status: s.status,
      durationMs: s.durationMs,
      notes: s.notes,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: WorkSessionRow): WorkSession {
    const snapshot: WorkSessionSnapshot = {
      id: asWorkSessionId(row.id),
      organizationId: row.organizationId as WorkSessionSnapshot["organizationId"],
      workOrderId: asWorkOrderId(row.workOrderId),
      startedAt: new Date(row.startedAt),
      endedAt: row.endedAt ? new Date(row.endedAt) : null,
      status: row.status as WorkSessionSnapshot["status"],
      durationMs: row.durationMs ?? null,
      notes: row.notes ?? null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return WorkSession.reconstitute(snapshot);
  },
};

export const WorkMilestoneMapper = {
  toRow(milestone: WorkMilestone): WorkMilestoneRow {
    const s = milestone.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      workOrderId: s.workOrderId,
      name: s.name,
      completed: s.completed,
      completedAt: s.completedAt,
      completedBy: s.completedBy,
      notes: s.notes,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: WorkMilestoneRow): WorkMilestone {
    const snapshot: WorkMilestoneSnapshot = {
      id: asWorkMilestoneId(row.id),
      organizationId: row.organizationId as WorkMilestoneSnapshot["organizationId"],
      workOrderId: asWorkOrderId(row.workOrderId),
      name: row.name,
      completed: row.completed,
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
      completedBy: row.completedBy ?? null,
      notes: row.notes ?? null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return WorkMilestone.reconstitute(snapshot);
  },
};

export const WorkOutputMapper = {
  toRow(output: WorkOutput): WorkOutputRow {
    const s = output.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      workOrderId: s.workOrderId,
      name: s.name,
      outputType: s.outputType,
      version: s.version,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: WorkOutputRow): WorkOutput {
    const snapshot: WorkOutputSnapshot = {
      id: asWorkOutputId(row.id),
      organizationId: row.organizationId as WorkOutputSnapshot["organizationId"],
      workOrderId: asWorkOrderId(row.workOrderId),
      name: row.name,
      outputType: row.outputType as WorkOutputSnapshot["outputType"],
      version: row.version,
      status: row.status as WorkOutputSnapshot["status"],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return WorkOutput.reconstitute(snapshot);
  },
};

export const WorkIncidentMapper = {
  toRow(incident: WorkIncident): WorkIncidentRow {
    const s = incident.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      workOrderId: s.workOrderId,
      incidentType: s.incidentType,
      severity: s.severity,
      description: s.description,
      reportedAt: s.reportedAt,
      resolved: s.resolved,
      resolvedAt: s.resolvedAt,
      resolution: s.resolution,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: WorkIncidentRow): WorkIncident {
    const snapshot: WorkIncidentSnapshot = {
      id: asWorkIncidentId(row.id),
      organizationId: row.organizationId as WorkIncidentSnapshot["organizationId"],
      workOrderId: asWorkOrderId(row.workOrderId),
      incidentType: row.incidentType as WorkIncidentSnapshot["incidentType"],
      severity: row.severity as WorkIncidentSnapshot["severity"],
      description: row.description,
      reportedAt: new Date(row.reportedAt),
      resolved: row.resolved,
      resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : null,
      resolution: row.resolution ?? null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return WorkIncident.reconstitute(snapshot);
  },
};
