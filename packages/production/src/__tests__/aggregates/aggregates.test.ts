import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { asWorkOrderId } from "@creative-lab/operations";
import { asProjectId } from "@creative-lab/projects";
import { Production } from "../../aggregates/Production/Production.js";
import { ProductionMilestone } from "../../aggregates/ProductionMilestone/ProductionMilestone.js";
import { ProductionSession } from "../../aggregates/ProductionSession/ProductionSession.js";
import { Revision } from "../../aggregates/Revision/Revision.js";
import { MilestoneStatus } from "../../enums/MilestoneStatus.js";
import { ProductionStatus } from "../../enums/ProductionStatus.js";
import { RevisionStatus } from "../../enums/RevisionStatus.js";
import { SessionStatus } from "../../enums/SessionStatus.js";
import {
  InvalidProductionStateError,
  InvalidSessionError,
  MilestoneSequenceError,
  RevisionLifecycleError,
} from "../../errors/ProductionErrors.js";
import {
  MilestoneActivated,
  MilestoneCompleted,
  ProductionArchived,
  ProductionCompleted,
  ProductionCreated,
  ProductionStarted,
  RevisionClosed,
  RevisionRequested,
  SessionCompleted,
  SessionOpened,
} from "../../events/production-events.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const workOrderId = asWorkOrderId("wo-1");

function createProduction(
  overrides: Partial<Parameters<typeof Production.create>[0]> = {},
) {
  return Production.create({
    organizationId: orgId,
    projectId,
    workOrderId,
    name: "Album Mix",
    ownerId: "owner-1",
    ...overrides,
  });
}

describe("Production aggregate", () => {
  it("creates CREATED with event", () => {
    const p = createProduction();
    expect(p.status).toBe(ProductionStatus.CREATED);
    expect(p.ownerId).toBe("owner-1");
    expect(p.pullDomainEvents()[0]).toBeInstanceOf(ProductionCreated);
  });

  it("lifecycle start → pause → resume → complete → archive", () => {
    const p = createProduction();
    p.pullDomainEvents();
    p.start();
    expect(p.status).toBe(ProductionStatus.ACTIVE);
    expect(p.pullDomainEvents().some((e) => e instanceof ProductionStarted)).toBe(
      true,
    );
    p.pause();
    expect(p.status).toBe(ProductionStatus.ON_HOLD);
    p.resume();
    expect(p.status).toBe(ProductionStatus.ACTIVE);
    p.complete();
    expect(p.status).toBe(ProductionStatus.COMPLETED);
    expect(
      p.pullDomainEvents().some((e) => e instanceof ProductionCompleted),
    ).toBe(true);
    p.archive();
    expect(p.status).toBe(ProductionStatus.ARCHIVED);
    expect(
      p.pullDomainEvents().some((e) => e instanceof ProductionArchived),
    ).toBe(true);
  });

  it("completed is immutable except archive", () => {
    const p = createProduction();
    p.start();
    p.complete();
    expect(() => p.start()).toThrow(InvalidProductionStateError);
    expect(() => p.updateDetails({ name: "X" })).toThrow(
      InvalidProductionStateError,
    );
  });

  it("archived is fully immutable", () => {
    const p = createProduction();
    p.archive();
    expect(() => p.start()).toThrow(InvalidProductionStateError);
  });

  it("requires one owner", () => {
    expect(() => createProduction({ ownerId: "  " })).toThrow(
      InvalidProductionStateError,
    );
  });

  it("reconstitutes from snapshot", () => {
    const p = createProduction();
    const r = Production.reconstitute(p.toSnapshot());
    expect(r.id).toBe(p.id);
    expect(r.name.value).toBe("Album Mix");
  });
});

describe("ProductionSession aggregate", () => {
  it("opens and completes with positive duration", () => {
    const prod = createProduction();
    const start = new Date("2026-08-01T10:00:00Z");
    const s = ProductionSession.create({
      organizationId: orgId,
      productionId: prod.id,
      startedAt: start,
    });
    expect(s.status).toBe(SessionStatus.OPEN);
    expect(s.pullDomainEvents()[0]).toBeInstanceOf(SessionOpened);
    const end = new Date("2026-08-01T12:00:00Z");
    s.complete(end);
    expect(s.status).toBe(SessionStatus.COMPLETED);
    expect(s.durationMs).toBe(2 * 60 * 60 * 1000);
    expect(s.pullDomainEvents()[0]).toBeInstanceOf(SessionCompleted);
  });

  it("pause and resume", () => {
    const prod = createProduction();
    const s = ProductionSession.create({
      organizationId: orgId,
      productionId: prod.id,
    });
    s.pause();
    expect(s.status).toBe(SessionStatus.PAUSED);
    s.resume();
    expect(s.status).toBe(SessionStatus.RESUMED);
  });

  it("rejects non-positive duration", () => {
    const prod = createProduction();
    const start = new Date("2026-08-01T10:00:00Z");
    const s = ProductionSession.create({
      organizationId: orgId,
      productionId: prod.id,
      startedAt: start,
    });
    expect(() => s.complete(start)).toThrow(InvalidSessionError);
  });

  it("completed session is immutable", () => {
    const prod = createProduction();
    const s = ProductionSession.create({
      organizationId: orgId,
      productionId: prod.id,
      startedAt: new Date("2026-08-01T10:00:00Z"),
    });
    s.complete(new Date("2026-08-01T11:00:00Z"));
    expect(() => s.pause()).toThrow(InvalidSessionError);
    expect(() => s.updateNotes("x")).toThrow(InvalidSessionError);
  });
});

describe("ProductionMilestone aggregate", () => {
  it("activates and completes", () => {
    const prod = createProduction();
    const m = ProductionMilestone.create({
      organizationId: orgId,
      productionId: prod.id,
      name: "Mixing",
      sequence: 1,
    });
    expect(m.status).toBe(MilestoneStatus.PENDING);
    m.activate();
    expect(m.status).toBe(MilestoneStatus.ACTIVE);
    expect(m.pullDomainEvents().some((e) => e instanceof MilestoneActivated)).toBe(
      true,
    );
    m.complete();
    expect(m.status).toBe(MilestoneStatus.COMPLETED);
    expect(
      m.pullDomainEvents().some((e) => e instanceof MilestoneCompleted),
    ).toBe(true);
  });

  it("completed milestone immutable", () => {
    const prod = createProduction();
    const m = ProductionMilestone.create({
      organizationId: orgId,
      productionId: prod.id,
      name: "Mastering",
      sequence: 1,
    });
    m.activate();
    m.complete();
    expect(() => m.complete()).toThrow(MilestoneSequenceError);
    expect(() => m.reorder(2)).toThrow(MilestoneSequenceError);
  });

  it("rejects invalid sequence", () => {
    const prod = createProduction();
    expect(() =>
      ProductionMilestone.create({
        organizationId: orgId,
        productionId: prod.id,
        name: "X",
        sequence: 0,
      }),
    ).toThrow(MilestoneSequenceError);
  });
});

describe("Revision aggregate", () => {
  it("lifecycle REQUESTED → IN_PROGRESS → COMPLETED → CLOSED", () => {
    const prod = createProduction();
    const r = Revision.create({
      organizationId: orgId,
      productionId: prod.id,
      requestedBy: "client-1",
      revisionNumber: 1,
      reason: "Louder vocals",
    });
    expect(r.status).toBe(RevisionStatus.REQUESTED);
    expect(r.pullDomainEvents()[0]).toBeInstanceOf(RevisionRequested);
    r.start();
    expect(r.status).toBe(RevisionStatus.IN_PROGRESS);
    r.complete();
    expect(r.status).toBe(RevisionStatus.COMPLETED);
    r.close();
    expect(r.status).toBe(RevisionStatus.CLOSED);
    expect(r.pullDomainEvents().some((e) => e instanceof RevisionClosed)).toBe(
      true,
    );
  });

  it("closed is immutable", () => {
    const prod = createProduction();
    const r = Revision.create({
      organizationId: orgId,
      productionId: prod.id,
      requestedBy: "c1",
      revisionNumber: 1,
      reason: "Fix",
    });
    r.close();
    expect(() => r.start()).toThrow(RevisionLifecycleError);
  });

  it("completed is immutable except close", () => {
    const prod = createProduction();
    const r = Revision.create({
      organizationId: orgId,
      productionId: prod.id,
      requestedBy: "c1",
      revisionNumber: 1,
      reason: "Fix",
    });
    r.start();
    r.complete();
    expect(() => r.start()).toThrow(RevisionLifecycleError);
  });
});
