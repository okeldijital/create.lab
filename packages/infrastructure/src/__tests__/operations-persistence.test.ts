import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { OrganizationId } from "@creative-lab/organization";
import {
  WorkIncident,
  WorkMilestone,
  WorkOrder,
  WorkOutput,
  WorkSession,
  WorkPriority,
  OutputType,
  IncidentType,
  IncidentSeverity,
  asAllocationId,
} from "@creative-lab/operations";
import { asBookingId } from "@creative-lab/scheduling";
import {
  WorkIncidentMapper,
  WorkMilestoneMapper,
  WorkOrderMapper,
  WorkOutputMapper,
  WorkSessionMapper,
} from "../persistence/operations/mappers.js";

const id = (): string => randomUUID();
const organizationId = id() as OrganizationId;
const now = new Date("2026-01-01T08:00:00.000Z");

const workOrder = WorkOrder.create({
  id: id(),
  organizationId,
  allocationId: asAllocationId(id()),
  bookingId: asBookingId(id()),
  title: "Record voiceover",
  description: "Studio session for brand film",
  priority: WorkPriority.HIGH,
  plannedStart: now,
  plannedEnd: new Date("2026-01-01T12:00:00.000Z"),
  now,
});

const session = WorkSession.create({
  id: id(),
  organizationId,
  workOrderId: workOrder.id,
  startedAt: now,
  notes: "Booth A",
  now,
});

const milestone = WorkMilestone.create({
  id: id(),
  organizationId,
  workOrderId: workOrder.id,
  name: "Rough cut ready",
  notes: "Internal review",
  now,
});

const output = WorkOutput.create({
  id: id(),
  organizationId,
  workOrderId: workOrder.id,
  name: "VO take",
  outputType: OutputType.AUDIO,
  version: 1,
  now,
});

const incident = WorkIncident.create({
  id: id(),
  organizationId,
  workOrderId: workOrder.id,
  incidentType: IncidentType.TECHNICAL,
  severity: IncidentSeverity.MEDIUM,
  description: "Mic channel drop",
  reportedAt: now,
  now,
});

describe("Operations persistence mappers", () => {
  it("round-trips WorkOrder", () => {
    const restored = WorkOrderMapper.fromRow(WorkOrderMapper.toRow(workOrder));
    expect(restored.toSnapshot()).toEqual(workOrder.toSnapshot());
  });

  it("round-trips WorkSession", () => {
    const restored = WorkSessionMapper.fromRow(WorkSessionMapper.toRow(session));
    expect(restored.toSnapshot()).toEqual(session.toSnapshot());
  });

  it("round-trips WorkMilestone", () => {
    const restored = WorkMilestoneMapper.fromRow(WorkMilestoneMapper.toRow(milestone));
    expect(restored.toSnapshot()).toEqual(milestone.toSnapshot());
  });

  it("round-trips WorkOutput", () => {
    const restored = WorkOutputMapper.fromRow(WorkOutputMapper.toRow(output));
    expect(restored.toSnapshot()).toEqual(output.toSnapshot());
  });

  it("round-trips WorkIncident", () => {
    const restored = WorkIncidentMapper.fromRow(WorkIncidentMapper.toRow(incident));
    expect(restored.toSnapshot()).toEqual(incident.toSnapshot());
  });
});
