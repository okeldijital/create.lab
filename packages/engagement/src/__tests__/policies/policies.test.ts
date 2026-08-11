import { describe, expect, it } from "vitest";
import { asContractId } from "@creative-lab/contracts";
import { asCustomerId } from "@creative-lab/crm";
import { asOrganizationId } from "@creative-lab/organization";
import { Deliverable } from "../../aggregates/Deliverable/Deliverable.js";
import { Engagement } from "../../aggregates/Engagement/Engagement.js";
import { Milestone } from "../../aggregates/Milestone/Milestone.js";
import { Obligation } from "../../aggregates/Obligation/Obligation.js";
import { EngagementStatus } from "../../enums/EngagementStatus.js";
import { ObligationParty } from "../../enums/ObligationParty.js";
import {
  EngagementValidationError,
  InvalidEngagementStateError,
  MilestoneSequenceError,
  ObligationAlreadyFulfilledError,
} from "../../errors/EngagementErrors.js";
import { DeliverablePolicy } from "../../policies/DeliverablePolicy.js";
import { EngagementLifecyclePolicy } from "../../policies/EngagementLifecyclePolicy.js";
import { MilestonePolicy } from "../../policies/MilestonePolicy.js";
import { ObligationPolicy } from "../../policies/ObligationPolicy.js";

const orgId = asOrganizationId("org-1");
const customerId = asCustomerId("cust-1");
const contractId = asContractId("ctr-1");

function eng() {
  return Engagement.create({
    organizationId: orgId,
    customerId,
    contractId,
    startDate: new Date("2026-01-01"),
  });
}

describe("EngagementLifecyclePolicy", () => {
  it("allows legal transitions", () => {
    const e = eng();
    EngagementLifecyclePolicy.assertCanTransition(e, EngagementStatus.ACTIVE);
    e.activate();
    EngagementLifecyclePolicy.assertOperational(e);
  });

  it("blocks structure on completed", () => {
    const e = eng();
    e.activate();
    e.complete();
    expect(() =>
      EngagementLifecyclePolicy.assertActiveOrDraftStructure(e),
    ).toThrow(InvalidEngagementStateError);
  });
});

describe("DeliverablePolicy", () => {
  it("unique sequence", () => {
    const e = eng();
    const d = Deliverable.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "A",
      sequence: 1,
    });
    DeliverablePolicy.assertUniqueSequence(2, [d]);
    expect(() => DeliverablePolicy.assertUniqueSequence(1, [d])).toThrow(
      EngagementValidationError,
    );
  });

  it("accept only completed", () => {
    const e = eng();
    const d = Deliverable.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "A",
      sequence: 1,
    });
    expect(() => DeliverablePolicy.assertCanAccept(d)).toThrow(
      EngagementValidationError,
    );
    d.start();
    d.complete();
    DeliverablePolicy.assertCanAccept(d);
  });

  it("nextSequence", () => {
    const e = eng();
    const d = Deliverable.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "A",
      sequence: 3,
    });
    expect(DeliverablePolicy.nextSequence([d])).toBe(4);
  });
});

describe("MilestonePolicy", () => {
  it("one active and chronological", () => {
    const e = eng();
    const m1 = Milestone.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "M1",
      targetDate: new Date("2026-02-01"),
      sequence: 1,
    });
    m1.activate();
    const m2 = Milestone.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "M2",
      targetDate: new Date("2026-03-01"),
      sequence: 2,
    });
    expect(() => MilestonePolicy.assertOneActive([m1, m2])).toThrow(
      MilestoneSequenceError,
    );
    MilestonePolicy.assertChronological(
      2,
      new Date("2026-03-01"),
      [m1],
    );
    expect(() =>
      MilestonePolicy.assertChronological(2, new Date("2026-01-15"), [m1]),
    ).toThrow(MilestoneSequenceError);
  });

  it("unique sequence", () => {
    const e = eng();
    const m = Milestone.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "M",
      targetDate: new Date("2026-02-01"),
      sequence: 1,
    });
    expect(() => MilestonePolicy.assertUniqueSequence(1, [m])).toThrow(
      MilestoneSequenceError,
    );
  });
});

describe("ObligationPolicy", () => {
  it("pending only", () => {
    const e = eng();
    const o = Obligation.create({
      organizationId: orgId,
      engagementId: e.id,
      party: ObligationParty.CUSTOMER,
      title: "Pay deposit",
    });
    ObligationPolicy.assertCanFulfill(o);
    o.fulfill();
    expect(() => ObligationPolicy.assertCanWaive(o)).toThrow(
      ObligationAlreadyFulfilledError,
    );
  });

  it("valid party", () => {
    ObligationPolicy.assertValidParty("ORGANIZATION");
    expect(() => ObligationPolicy.assertValidParty("ALIEN")).toThrow(
      EngagementValidationError,
    );
  });
});

describe("EngagementLifecyclePolicy extras", () => {
  it("blocks operational when suspended", () => {
    const e = eng();
    e.activate();
    e.suspend();
    expect(() => EngagementLifecyclePolicy.assertOperational(e)).toThrow(
      InvalidEngagementStateError,
    );
  });

  it("allows archive transition", () => {
    const e = eng();
    EngagementLifecyclePolicy.assertCanTransition(
      e,
      EngagementStatus.ARCHIVED,
    );
  });
});

describe("MilestonePolicy extras", () => {
  it("nextSequence", () => {
    const e = eng();
    const m = Milestone.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "M",
      targetDate: new Date("2026-02-01"),
      sequence: 5,
    });
    expect(MilestonePolicy.nextSequence([m])).toBe(6);
  });
});

describe("DeliverablePolicy extras", () => {
  it("blocks accept when already accepted", () => {
    const e = eng();
    const d = Deliverable.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "A",
      sequence: 1,
    });
    d.start();
    d.complete();
    d.accept();
    expect(() => DeliverablePolicy.assertCanAccept(d)).toThrow();
  });
});
