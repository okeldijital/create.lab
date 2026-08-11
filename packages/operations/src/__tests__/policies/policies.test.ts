import { describe, expect, it } from "vitest";
import { asAllocationId } from "../../types/ids.js";
import { asOrganizationId } from "@creative-lab/organization";
import { asBookingId } from "@creative-lab/scheduling";
import { WorkMilestone } from "../../aggregates/WorkMilestone/WorkMilestone.js";
import { WorkOrder } from "../../aggregates/WorkOrder/WorkOrder.js";
import { WorkOutput } from "../../aggregates/WorkOutput/WorkOutput.js";
import { WorkSession } from "../../aggregates/WorkSession/WorkSession.js";
import { OutputType } from "../../enums/OutputType.js";
import { WorkOrderStatus } from "../../enums/WorkOrderStatus.js";
import {
  DuplicateMilestoneError,
  OutputVersionConflictError,
  SessionOverlapError,
  InvalidWorkStateError,
} from "../../errors/OperationsErrors.js";
import {
  MilestonePolicy,
  OutputPolicy,
  SessionPolicy,
  WorkLifecyclePolicy,
} from "../../policies/index.js";

const orgId = asOrganizationId("org-1");
const allocationId = asAllocationId("alloc-1");
const bookingId = asBookingId("booking-1");

function order() {
  return WorkOrder.create({
    organizationId: orgId,
    allocationId,
    bookingId,
    title: "WO",
    plannedStart: new Date("2026-08-01T09:00:00Z"),
    plannedEnd: new Date("2026-08-01T17:00:00Z"),
  });
}

describe("SessionPolicy", () => {
  it("detects overlapping sessions", () => {
    const wo = order();
    const s1 = WorkSession.create({
      organizationId: orgId,
      workOrderId: wo.id,
      startedAt: new Date("2026-08-01T10:00:00Z"),
    });
    s1.end(new Date("2026-08-01T12:00:00Z"));
    expect(() =>
      SessionPolicy.assertNoOverlapWithSessions(
        [s1],
        {
          startedAt: new Date("2026-08-01T11:00:00Z"),
          endedAt: new Date("2026-08-01T13:00:00Z"),
        },
        new Date("2026-08-01T14:00:00Z"),
      ),
    ).toThrow(SessionOverlapError);
  });

  it("allows non-overlapping sessions", () => {
    const wo = order();
    const s1 = WorkSession.create({
      organizationId: orgId,
      workOrderId: wo.id,
      startedAt: new Date("2026-08-01T10:00:00Z"),
    });
    s1.end(new Date("2026-08-01T12:00:00Z"));
    expect(() =>
      SessionPolicy.assertNoOverlapWithSessions(
        [s1],
        {
          startedAt: new Date("2026-08-01T12:00:00Z"),
          endedAt: new Date("2026-08-01T14:00:00Z"),
        },
      ),
    ).not.toThrow();
  });
});

describe("MilestonePolicy", () => {
  it("rejects duplicate names case-insensitively", () => {
    const wo = order();
    const m = WorkMilestone.create({
      organizationId: orgId,
      workOrderId: wo.id,
      name: "Recording Complete",
    });
    expect(() =>
      MilestonePolicy.assertUniqueName(
        [m],
        "recording complete",
        wo.id,
      ),
    ).toThrow(DuplicateMilestoneError);
  });
});

describe("OutputPolicy", () => {
  it("auto-increments versions", () => {
    const wo = order();
    const o1 = WorkOutput.create({
      organizationId: orgId,
      workOrderId: wo.id,
      name: "Mix",
      outputType: OutputType.AUDIO,
      version: 1,
    });
    const o2 = WorkOutput.create({
      organizationId: orgId,
      workOrderId: wo.id,
      name: "Mix",
      outputType: OutputType.AUDIO,
      version: 2,
    });
    expect(OutputPolicy.nextVersion([o1, o2]).value).toBe(3);
    expect(() => OutputPolicy.assertVersionAvailable([o1, o2], 2)).toThrow(
      OutputVersionConflictError,
    );
  });
});

describe("WorkLifecyclePolicy", () => {
  it("blocks execution on closed orders", () => {
    const wo = order();
    wo.start(new Date("2026-08-01T10:00:00Z"));
    wo.complete(new Date("2026-08-01T12:00:00Z"));
    wo.close();
    expect(() => WorkLifecyclePolicy.assertAcceptsExecution(wo)).toThrow(
      InvalidWorkStateError,
    );
  });

  it("allows start from CREATED", () => {
    const wo = order();
    expect(() => WorkLifecyclePolicy.assertCanStart(wo)).not.toThrow();
    expect(canReady(wo)).toBe(true);
  });
});

function canReady(wo: WorkOrder): boolean {
  try {
    WorkLifecyclePolicy.assertCanTransition(wo, WorkOrderStatus.READY);
    return true;
  } catch {
    return false;
  }
}
