import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { asWorkOrderId } from "@creative-lab/operations";
import { asProjectId } from "@creative-lab/projects";
import { Production } from "../../aggregates/Production/Production.js";
import { ProductionMilestone } from "../../aggregates/ProductionMilestone/ProductionMilestone.js";
import { ProductionSession } from "../../aggregates/ProductionSession/ProductionSession.js";
import { Revision } from "../../aggregates/Revision/Revision.js";
import {
  DuplicateMilestoneError,
  DuplicateProductionError,
  DuplicateRevisionError,
  MilestoneSequenceError,
  SessionAlreadyOpenError,
} from "../../errors/ProductionErrors.js";
import {
  MilestonePolicy,
  ProductionLifecyclePolicy,
  RevisionPolicy,
  SessionPolicy,
} from "../../policies/index.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const workOrderId = asWorkOrderId("wo-1");

function production(name = "Prod A") {
  return Production.create({
    organizationId: orgId,
    projectId,
    workOrderId,
    name,
    ownerId: "o1",
  });
}

describe("ProductionLifecyclePolicy", () => {
  it("enforces unique names", () => {
    const p = production("Album Mix");
    expect(() =>
      ProductionLifecyclePolicy.assertUniqueName([p], "album mix", orgId),
    ).toThrow(DuplicateProductionError);
  });

  it("blocks child activity on completed", () => {
    const p = production();
    p.start();
    p.complete();
    expect(() =>
      ProductionLifecyclePolicy.assertAcceptsChildActivity(p),
    ).toThrow();
  });
});

describe("SessionPolicy", () => {
  it("rejects second open session", () => {
    const p = production();
    const s = ProductionSession.create({
      organizationId: orgId,
      productionId: p.id,
    });
    expect(() => SessionPolicy.assertNoOpenSession([s], p.id)).toThrow(
      SessionAlreadyOpenError,
    );
  });

  it("validates end after start", () => {
    const a = new Date("2026-01-01T00:00:00Z");
    const b = new Date("2026-01-01T01:00:00Z");
    expect(() => SessionPolicy.assertEndAfterStart(b, a)).toThrow();
    expect(() => SessionPolicy.assertEndAfterStart(a, b)).not.toThrow();
  });
});

describe("MilestonePolicy", () => {
  it("rejects duplicate sequence and gaps", () => {
    const p = production();
    const m1 = ProductionMilestone.create({
      organizationId: orgId,
      productionId: p.id,
      name: "Recording",
      sequence: 1,
    });
    expect(() => MilestonePolicy.assertUniqueSequence([m1], 1)).toThrow(
      DuplicateMilestoneError,
    );
    expect(() => MilestonePolicy.assertNoGaps([m1], 3)).toThrow(
      MilestoneSequenceError,
    );
  });

  it("enforces single active and ordered activation", () => {
    const p = production();
    const m1 = ProductionMilestone.create({
      organizationId: orgId,
      productionId: p.id,
      name: "Recording",
      sequence: 1,
    });
    m1.activate();
    const m2 = ProductionMilestone.create({
      organizationId: orgId,
      productionId: p.id,
      name: "Editing",
      sequence: 2,
    });
    expect(() => MilestonePolicy.assertSingleActive([m1, m2])).toThrow(
      MilestoneSequenceError,
    );
    expect(() =>
      MilestonePolicy.assertOrderedActivation([m1, m2], m2),
    ).toThrow(MilestoneSequenceError);
    m1.complete();
    expect(() =>
      MilestonePolicy.assertOrderedActivation([m1, m2], m2),
    ).not.toThrow();
  });
});

describe("RevisionPolicy", () => {
  it("computes sequential numbers", () => {
    const p = production();
    expect(RevisionPolicy.nextNumber([]).value).toBe(1);
    const r1 = Revision.create({
      organizationId: orgId,
      productionId: p.id,
      requestedBy: "c",
      revisionNumber: 1,
      reason: "a",
    });
    expect(RevisionPolicy.nextNumber([r1]).value).toBe(2);
    expect(() => RevisionPolicy.assertSequential([r1], 1)).toThrow(
      DuplicateRevisionError,
    );
    expect(() => RevisionPolicy.assertSequential([r1], 2)).not.toThrow();
  });
});
