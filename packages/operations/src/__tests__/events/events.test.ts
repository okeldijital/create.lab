import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { asAllocationId } from "../../types/ids.js";
import { asOrganizationId } from "@creative-lab/organization";
import { asBookingId } from "@creative-lab/scheduling";
import { IncidentSeverity } from "../../enums/IncidentSeverity.js";
import { IncidentType } from "../../enums/IncidentType.js";
import { OutputType } from "../../enums/OutputType.js";
import { WorkOrderStatus } from "../../enums/WorkOrderStatus.js";
import {
  IncidentReported,
  IncidentResolved,
  MilestoneCompleted,
  OutputApproved,
  OutputCreated,
  SessionEnded,
  SessionStarted,
  WorkClosed,
  WorkCompleted,
  WorkOrderCreated,
  WorkPaused,
  WorkStarted,
} from "../../events/operations-events.js";
import {
  asWorkIncidentId,
  asWorkMilestoneId,
  asWorkOrderId,
  asWorkOutputId,
  asWorkSessionId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const workOrderId = asWorkOrderId("wo-1");

describe("Domain events", () => {
  it("are immutable and versioned", () => {
    const event = WorkOrderCreated.create({
      organizationId: orgId,
      workOrderId,
      allocationId: asAllocationId("a1"),
      bookingId: asBookingId("b1"),
      title: "WO",
      status: WorkOrderStatus.CREATED,
    });
    expect(event.eventType).toBe("WorkOrderCreated");
    expect(event.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(event.aggregateId).toBe(workOrderId);
    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.payload)).toBe(true);
  });

  it("covers minimum event set", () => {
    const factories = [
      WorkStarted.create({
        organizationId: orgId,
        workOrderId,
        actualStart: new Date(),
      }),
      WorkPaused.create({ organizationId: orgId, workOrderId }),
      WorkCompleted.create({
        organizationId: orgId,
        workOrderId,
        actualEnd: new Date(),
      }),
      WorkClosed.create({
        organizationId: orgId,
        workOrderId,
        closedAt: new Date(),
      }),
      SessionStarted.create({
        organizationId: orgId,
        sessionId: asWorkSessionId("s1"),
        workOrderId,
        startedAt: new Date(),
      }),
      SessionEnded.create({
        organizationId: orgId,
        sessionId: asWorkSessionId("s1"),
        workOrderId,
        endedAt: new Date(),
        durationMs: 1000,
      }),
      MilestoneCompleted.create({
        organizationId: orgId,
        milestoneId: asWorkMilestoneId("m1"),
        workOrderId,
        name: "Done",
      }),
      OutputCreated.create({
        organizationId: orgId,
        outputId: asWorkOutputId("o1"),
        workOrderId,
        name: "Mix",
        version: 1,
        outputType: OutputType.AUDIO,
      }),
      OutputApproved.create({
        organizationId: orgId,
        outputId: asWorkOutputId("o1"),
        workOrderId,
        version: 1,
      }),
      IncidentReported.create({
        organizationId: orgId,
        incidentId: asWorkIncidentId("i1"),
        workOrderId,
        incidentType: IncidentType.TECHNICAL,
        severity: IncidentSeverity.HIGH,
      }),
      IncidentResolved.create({
        organizationId: orgId,
        incidentId: asWorkIncidentId("i1"),
        workOrderId,
      }),
    ];
    for (const e of factories) {
      expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
      expect(e.organizationId).toBe(orgId);
    }
  });
});
