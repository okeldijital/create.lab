import { describe, expect, it } from "vitest";
import { asAllocationId } from "../../types/ids.js";
import { asOrganizationId } from "@creative-lab/organization";
import { asBookingId } from "@creative-lab/scheduling";
import { WorkIncident } from "../../aggregates/WorkIncident/WorkIncident.js";
import { WorkMilestone } from "../../aggregates/WorkMilestone/WorkMilestone.js";
import { WorkOrder } from "../../aggregates/WorkOrder/WorkOrder.js";
import { WorkOutput } from "../../aggregates/WorkOutput/WorkOutput.js";
import { WorkSession } from "../../aggregates/WorkSession/WorkSession.js";
import { IncidentSeverity } from "../../enums/IncidentSeverity.js";
import { IncidentType } from "../../enums/IncidentType.js";
import { OutputStatus } from "../../enums/OutputStatus.js";
import { OutputType } from "../../enums/OutputType.js";
import { SessionStatus } from "../../enums/SessionStatus.js";
import { WorkOrderStatus } from "../../enums/WorkOrderStatus.js";
import { WorkPriority } from "../../enums/WorkPriority.js";
import {
  InvalidWorkStateError,
  IncidentAlreadyResolvedError,
  MilestoneAlreadyCompletedError,
} from "../../errors/OperationsErrors.js";
import {
  IncidentReported,
  MilestoneCompleted,
  OutputCreated,
  SessionEnded,
  SessionStarted,
  WorkClosed,
  WorkCompleted,
  WorkOrderCreated,
  WorkStarted,
} from "../../events/operations-events.js";

const orgId = asOrganizationId("org-1");
const allocationId = asAllocationId("alloc-1");
const bookingId = asBookingId("booking-1");
const plannedStart = new Date("2026-08-01T09:00:00Z");
const plannedEnd = new Date("2026-08-01T17:00:00Z");

function createOrder(overrides: Partial<Parameters<typeof WorkOrder.create>[0]> = {}) {
  return WorkOrder.create({
    organizationId: orgId,
    allocationId,
    bookingId,
    title: "Recording Session WO",
    plannedStart,
    plannedEnd,
    ...overrides,
  });
}

describe("WorkOrder lifecycle", () => {
  it("creates in CREATED with WorkOrderCreated event", () => {
    const order = createOrder();
    expect(order.status).toBe(WorkOrderStatus.CREATED);
    expect(order.allocationId).toBe(allocationId);
    expect(order.bookingId).toBe(bookingId);
    const events = order.pullDomainEvents();
    expect(events[0]).toBeInstanceOf(WorkOrderCreated);
  });

  it("follows CREATED → READY → IN_PROGRESS → COMPLETED → CLOSED", () => {
    const order = createOrder();
    order.pullDomainEvents();
    order.markReady();
    expect(order.status).toBe(WorkOrderStatus.READY);
    const t0 = new Date("2026-08-01T10:00:00Z");
    order.start(t0);
    expect(order.status).toBe(WorkOrderStatus.IN_PROGRESS);
    expect(order.actualStart?.toISOString()).toBe(t0.toISOString());
    expect(order.pullDomainEvents().some((e) => e instanceof WorkStarted)).toBe(
      true,
    );
    const t1 = new Date("2026-08-01T16:00:00Z");
    order.complete(t1);
    expect(order.status).toBe(WorkOrderStatus.COMPLETED);
    expect(order.actualEnd?.toISOString()).toBe(t1.toISOString());
    expect(
      order.pullDomainEvents().some((e) => e instanceof WorkCompleted),
    ).toBe(true);
    const t2 = new Date("2026-08-01T18:00:00Z");
    order.close(t2);
    expect(order.status).toBe(WorkOrderStatus.CLOSED);
    expect(order.closedAt?.toISOString()).toBe(t2.toISOString());
    expect(order.pullDomainEvents().some((e) => e instanceof WorkClosed)).toBe(
      true,
    );
  });

  it("cannot complete before starting", () => {
    const order = createOrder();
    order.markReady();
    expect(() => order.complete()).toThrow(InvalidWorkStateError);
  });

  it("cannot reopen closed work", () => {
    const order = createOrder();
    order.start(new Date("2026-08-01T10:00:00Z"));
    order.complete(new Date("2026-08-01T12:00:00Z"));
    order.close();
    expect(() => order.start()).toThrow(InvalidWorkStateError);
    expect(() => order.markReady()).toThrow(InvalidWorkStateError);
  });

  it("pauses and resumes", () => {
    const order = createOrder();
    order.start();
    order.pause();
    expect(order.status).toBe(WorkOrderStatus.PAUSED);
    order.resume();
    expect(order.status).toBe(WorkOrderStatus.IN_PROGRESS);
  });

  it("rejects invalid planned range", () => {
    expect(() =>
      createOrder({
        plannedStart: plannedEnd,
        plannedEnd: plannedStart,
      }),
    ).toThrow(InvalidWorkStateError);
  });

  it("requires actualEnd after actualStart", () => {
    const order = createOrder();
    const t = new Date("2026-08-01T10:00:00Z");
    order.start(t);
    expect(() => order.complete(t)).toThrow(InvalidWorkStateError);
  });

  it("reconstitutes from snapshot", () => {
    const order = createOrder({ priority: WorkPriority.HIGH });
    const snap = order.toSnapshot();
    const restored = WorkOrder.reconstitute(snap);
    expect(restored.id).toBe(order.id);
    expect(restored.priority.value).toBe(WorkPriority.HIGH);
    expect(restored.status).toBe(WorkOrderStatus.CREATED);
  });
});

describe("WorkSession", () => {
  it("starts ACTIVE and ends with positive duration", () => {
    const order = createOrder();
    const start = new Date("2026-08-01T10:00:00Z");
    const session = WorkSession.create({
      organizationId: orgId,
      workOrderId: order.id,
      startedAt: start,
    });
    expect(session.status).toBe(SessionStatus.ACTIVE);
    expect(session.pullDomainEvents()[0]).toBeInstanceOf(SessionStarted);
    const end = new Date("2026-08-01T12:00:00Z");
    session.end(end);
    expect(session.status).toBe(SessionStatus.COMPLETED);
    expect(session.durationMs).toBe(2 * 60 * 60 * 1000);
    expect(session.pullDomainEvents()[0]).toBeInstanceOf(SessionEnded);
  });

  it("rejects non-positive duration", () => {
    const order = createOrder();
    const start = new Date("2026-08-01T10:00:00Z");
    const session = WorkSession.create({
      organizationId: orgId,
      workOrderId: order.id,
      startedAt: start,
    });
    expect(() => session.end(start)).toThrow(InvalidWorkStateError);
  });

  it("pause and resume", () => {
    const order = createOrder();
    const session = WorkSession.create({
      organizationId: orgId,
      workOrderId: order.id,
    });
    session.pause();
    expect(session.status).toBe(SessionStatus.PAUSED);
    session.resume();
    expect(session.status).toBe(SessionStatus.ACTIVE);
  });
});

describe("WorkMilestone", () => {
  it("completes once and becomes immutable", () => {
    const order = createOrder();
    const m = WorkMilestone.create({
      organizationId: orgId,
      workOrderId: order.id,
      name: "Recording Complete",
    });
    m.complete("user-1");
    expect(m.completed).toBe(true);
    expect(m.completedBy).toBe("user-1");
    expect(m.pullDomainEvents()[0]).toBeInstanceOf(MilestoneCompleted);
    expect(() => m.complete()).toThrow(MilestoneAlreadyCompletedError);
    expect(() => m.updateNotes("x")).toThrow(MilestoneAlreadyCompletedError);
  });
});

describe("WorkOutput", () => {
  it("creates DRAFT metadata with version and OutputCreated", () => {
    const order = createOrder();
    const out = WorkOutput.create({
      organizationId: orgId,
      workOrderId: order.id,
      name: "Mix v1",
      outputType: OutputType.AUDIO,
      version: 1,
    });
    expect(out.status).toBe(OutputStatus.DRAFT);
    expect(out.version.value).toBe(1);
    expect(out.pullDomainEvents()[0]).toBeInstanceOf(OutputCreated);
  });

  it("advances DRAFT → REVIEW → APPROVED → DELIVERED", () => {
    const order = createOrder();
    const out = WorkOutput.create({
      organizationId: orgId,
      workOrderId: order.id,
      name: "Master",
      outputType: OutputType.AUDIO,
    });
    out.pullDomainEvents();
    out.submitForReview();
    out.approve();
    expect(out.status).toBe(OutputStatus.APPROVED);
    out.deliver();
    expect(out.status).toBe(OutputStatus.DELIVERED);
  });
});

describe("WorkIncident", () => {
  it("reports and resolves once", () => {
    const order = createOrder();
    const incident = WorkIncident.create({
      organizationId: orgId,
      workOrderId: order.id,
      incidentType: IncidentType.TECHNICAL,
      severity: IncidentSeverity.HIGH,
      description: "Equipment failure",
    });
    expect(incident.resolved).toBe(false);
    expect(incident.pullDomainEvents()[0]).toBeInstanceOf(IncidentReported);
    incident.resolve("Replaced interface");
    expect(incident.resolved).toBe(true);
    expect(() => incident.resolve("again")).toThrow(
      IncidentAlreadyResolvedError,
    );
  });
});
