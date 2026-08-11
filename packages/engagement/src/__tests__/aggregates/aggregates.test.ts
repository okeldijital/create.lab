import { describe, expect, it } from "vitest";
import { asContractId } from "@creative-lab/contracts";
import { asCustomerId } from "@creative-lab/crm";
import { asOrganizationId } from "@creative-lab/organization";
import { Deliverable } from "../../aggregates/Deliverable/Deliverable.js";
import { Engagement } from "../../aggregates/Engagement/Engagement.js";
import { Milestone } from "../../aggregates/Milestone/Milestone.js";
import { Obligation } from "../../aggregates/Obligation/Obligation.js";
import { DeliverableStatus } from "../../enums/DeliverableStatus.js";
import { EngagementStatus } from "../../enums/EngagementStatus.js";
import { MilestoneStatus } from "../../enums/MilestoneStatus.js";
import { ObligationParty } from "../../enums/ObligationParty.js";
import { ObligationStatus } from "../../enums/ObligationStatus.js";
import {
  DeliverableAlreadyAcceptedError,
  InvalidEngagementStateError,
  ObligationAlreadyFulfilledError,
} from "../../errors/EngagementErrors.js";
import {
  DeliverableCreated,
  EngagementActivated,
  EngagementCreated,
  MilestoneCreated,
  ObligationCreated,
} from "../../events/engagement-events.js";

const orgId = asOrganizationId("org-1");
const customerId = asCustomerId("cust-1");
const contractId = asContractId("ctr-1");

function createEng(
  overrides: Partial<Parameters<typeof Engagement.create>[0]> = {},
) {
  return Engagement.create({
    organizationId: orgId,
    customerId,
    contractId,
    engagementNumber: "ENG-001",
    startDate: new Date("2026-01-01"),
    targetCompletionDate: new Date("2026-12-01"),
    ...overrides,
  });
}

describe("Engagement aggregate", () => {
  it("creates DRAFT with event", () => {
    const e = createEng();
    expect(e.status).toBe(EngagementStatus.DRAFT);
    expect(e.engagementNumber.value).toBe("ENG-001");
    expect(e.pullDomainEvents()[0]).toBeInstanceOf(EngagementCreated);
  });

  it("lifecycle activate suspend resume complete archive", () => {
    const e = createEng();
    e.pullDomainEvents();
    e.activate();
    expect(e.isActive).toBe(true);
    expect(e.pullDomainEvents()[0]).toBeInstanceOf(EngagementActivated);
    e.suspend();
    expect(e.status).toBe(EngagementStatus.SUSPENDED);
    e.resume();
    expect(e.isActive).toBe(true);
    e.complete(new Date("2026-11-01"));
    expect(e.isCompleted).toBe(true);
    expect(e.completedDate).not.toBeNull();
    e.archive();
    expect(e.isArchived).toBe(true);
  });

  it("cancel and immutability", () => {
    const e = createEng({ engagementNumber: "ENG-002" });
    e.cancel();
    expect(e.status).toBe(EngagementStatus.CANCELLED);
    e.archive();
    expect(() => e.activate()).toThrow(InvalidEngagementStateError);
  });

  it("completed date validation", () => {
    const e = createEng({ engagementNumber: "ENG-003" });
    e.activate();
    expect(() => e.complete(new Date("2020-01-01"))).toThrow(
      InvalidEngagementStateError,
    );
  });

  it("requires customer and contract", () => {
    expect(() =>
      Engagement.create({
        organizationId: orgId,
        customerId: "" as never,
        contractId,
        startDate: new Date(),
      }),
    ).toThrow(InvalidEngagementStateError);
  });

  it("reconstitutes", () => {
    const e = createEng({ engagementNumber: "SNAP" });
    expect(Engagement.reconstitute(e.toSnapshot()).engagementNumber.value).toBe(
      "SNAP",
    );
  });

  it("tracks child ids", () => {
    const e = createEng({ engagementNumber: "CH" });
    e.addDeliverableId("d1" as never);
    e.addMilestoneId("m1" as never);
    e.addObligationId("o1" as never);
    expect(e.deliverableIds.length).toBe(1);
    expect(e.milestoneIds.length).toBe(1);
    expect(e.obligationIds.length).toBe(1);
  });
});

describe("Deliverable aggregate", () => {
  it("lifecycle planned → progress → complete → accept", () => {
    const e = createEng();
    const d = Deliverable.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "Master",
      sequence: 1,
    });
    expect(d.status).toBe(DeliverableStatus.PLANNED);
    expect(d.pullDomainEvents()[0]).toBeInstanceOf(DeliverableCreated);
    d.start();
    d.complete();
    d.accept();
    expect(d.isAccepted).toBe(true);
    expect(() => d.start()).toThrow(DeliverableAlreadyAcceptedError);
  });

  it("setSequence and reconstitute", () => {
    const e = createEng();
    const d = Deliverable.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "X",
      sequence: 1,
    });
    d.setSequence(3);
    expect(d.sequence).toBe(3);
    expect(Deliverable.reconstitute(d.toSnapshot()).title.value).toBe("X");
  });
});

describe("Milestone aggregate", () => {
  it("lifecycle and immutability", () => {
    const e = createEng();
    const m = Milestone.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "Kickoff",
      targetDate: new Date("2026-02-01"),
      sequence: 1,
    });
    expect(m.pullDomainEvents()[0]).toBeInstanceOf(MilestoneCreated);
    m.activate();
    expect(m.status).toBe(MilestoneStatus.ACTIVE);
    m.complete();
    expect(m.isCompleted).toBe(true);
    expect(() => m.activate()).toThrow(InvalidEngagementStateError);
  });

  it("reconstitutes", () => {
    const e = createEng();
    const m = Milestone.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "M",
      targetDate: new Date("2026-03-01"),
      sequence: 2,
    });
    expect(Milestone.reconstitute(m.toSnapshot()).sequence).toBe(2);
  });
});

describe("Obligation aggregate", () => {
  it("fulfill and waive terminal", () => {
    const e = createEng();
    const o = Obligation.create({
      organizationId: orgId,
      engagementId: e.id,
      party: ObligationParty.ORGANIZATION,
      title: "Provide assets",
    });
    expect(o.status).toBe(ObligationStatus.PENDING);
    expect(o.pullDomainEvents()[0]).toBeInstanceOf(ObligationCreated);
    o.fulfill();
    expect(o.isTerminal).toBe(true);
    expect(() => o.waive()).toThrow(ObligationAlreadyFulfilledError);

    const o2 = Obligation.create({
      organizationId: orgId,
      engagementId: e.id,
      party: ObligationParty.CUSTOMER,
      title: "Feedback",
    });
    o2.waive();
    expect(o2.status).toBe(ObligationStatus.WAIVED);
  });

  it("reconstitutes", () => {
    const e = createEng();
    const o = Obligation.create({
      organizationId: orgId,
      engagementId: e.id,
      party: ObligationParty.BOTH,
      title: "Align",
    });
    expect(Obligation.reconstitute(o.toSnapshot()).party).toBe(
      ObligationParty.BOTH,
    );
  });
});

describe("Engagement extra rules", () => {
  it("generates number when omitted", () => {
    const e = Engagement.create({
      organizationId: orgId,
      customerId,
      contractId,
      startDate: new Date("2026-01-01"),
    });
    expect(e.engagementNumber.value.startsWith("ENG-")).toBe(true);
  });

  it("rejects target before start", () => {
    expect(() =>
      createEng({
        engagementNumber: "BAD-DATE",
        startDate: new Date("2026-06-01"),
        targetCompletionDate: new Date("2026-01-01"),
      }),
    ).toThrow(InvalidEngagementStateError);
  });

  it("customer and contract immutable", () => {
    const e = createEng();
    expect(e.customerId).toBe(customerId);
    expect(e.contractId).toBe(contractId);
  });

  it("cannot complete twice", () => {
    const e = createEng({ engagementNumber: "DBL-C" });
    e.activate();
    e.complete();
    expect(() => e.complete()).toThrow(InvalidEngagementStateError);
  });

  it("cannot add structure after cancel", () => {
    const e = createEng({ engagementNumber: "CAN-S" });
    e.cancel();
    expect(() => e.addDeliverableId("d" as never)).toThrow(
      InvalidEngagementStateError,
    );
  });
});

describe("Deliverable extra", () => {
  it("rejects illegal skip to accept", () => {
    const e = createEng();
    const d = Deliverable.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "X",
      sequence: 1,
    });
    expect(() => d.accept()).toThrow();
  });

  it("progress path only", () => {
    const e = createEng();
    const d = Deliverable.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "Y",
      sequence: 1,
    });
    d.start();
    expect(d.status).toBe(DeliverableStatus.IN_PROGRESS);
    expect(() => d.accept()).toThrow();
  });
});

describe("Milestone extra", () => {
  it("cannot complete from planned", () => {
    const e = createEng();
    const m = Milestone.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "M",
      targetDate: new Date("2026-04-01"),
      sequence: 1,
    });
    expect(() => m.complete()).toThrow(InvalidEngagementStateError);
  });
});

describe("Engagement suspend resume only", () => {
  it("resume only from suspended", () => {
    const e = createEng({ engagementNumber: "RES" });
    e.activate();
    expect(() => e.resume()).toThrow(InvalidEngagementStateError);
    e.suspend();
    e.resume();
    expect(e.isActive).toBe(true);
  });
});
