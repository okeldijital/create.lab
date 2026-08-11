import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { asOrganizationId } from "@creative-lab/organization";
import { DeliverableStatus } from "../../enums/DeliverableStatus.js";
import { EngagementStatus } from "../../enums/EngagementStatus.js";
import { MilestoneStatus } from "../../enums/MilestoneStatus.js";
import { ObligationStatus } from "../../enums/ObligationStatus.js";
import {
  DeliverableAccepted,
  DeliverableCompleted,
  DeliverableCreated,
  EngagementActivated,
  EngagementArchived,
  EngagementCancelled,
  EngagementCompleted,
  EngagementCreated,
  EngagementSuspended,
  MilestoneActivated,
  MilestoneCompleted,
  MilestoneCreated,
  ObligationCreated,
  ObligationFulfilled,
  ObligationWaived,
} from "../../events/engagement-events.js";
import {
  asDeliverableId,
  asEngagementId,
  asMilestoneId,
  asObligationId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const engagementId = asEngagementId("e1");

describe("Domain events", () => {
  it("EngagementCreated frozen versioned", () => {
    const e = EngagementCreated.create({
      organizationId: orgId,
      engagementId,
      engagementNumber: "ENG-1",
      customerId: "c",
      contractId: "ctr",
      status: EngagementStatus.DRAFT,
    });
    expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(Object.isFrozen(e)).toBe(true);
    expect(Object.isFrozen(e.payload)).toBe(true);
    expect(e.payload.engagementNumber).toBe("ENG-1");
  });

  it("covers engagement event set", () => {
    const events = [
      EngagementActivated.create({ organizationId: orgId, engagementId }),
      EngagementSuspended.create({ organizationId: orgId, engagementId }),
      EngagementCompleted.create({
        organizationId: orgId,
        engagementId,
        completedDate: new Date(),
      }),
      EngagementCancelled.create({ organizationId: orgId, engagementId }),
      EngagementArchived.create({ organizationId: orgId, engagementId }),
      DeliverableCreated.create({
        organizationId: orgId,
        deliverableId: asDeliverableId("d1"),
        engagementId,
        title: "D",
        sequence: 1,
      }),
      DeliverableCompleted.create({
        organizationId: orgId,
        deliverableId: asDeliverableId("d1"),
        engagementId,
      }),
      DeliverableAccepted.create({
        organizationId: orgId,
        deliverableId: asDeliverableId("d1"),
        engagementId,
        status: DeliverableStatus.ACCEPTED,
      }),
      MilestoneCreated.create({
        organizationId: orgId,
        milestoneId: asMilestoneId("m1"),
        engagementId,
        title: "M",
        sequence: 1,
      }),
      MilestoneActivated.create({
        organizationId: orgId,
        milestoneId: asMilestoneId("m1"),
        engagementId,
        status: MilestoneStatus.ACTIVE,
      }),
      MilestoneCompleted.create({
        organizationId: orgId,
        milestoneId: asMilestoneId("m1"),
        engagementId,
      }),
      ObligationCreated.create({
        organizationId: orgId,
        obligationId: asObligationId("o1"),
        engagementId,
        title: "O",
        status: ObligationStatus.PENDING,
      }),
      ObligationFulfilled.create({
        organizationId: orgId,
        obligationId: asObligationId("o1"),
        engagementId,
      }),
      ObligationWaived.create({
        organizationId: orgId,
        obligationId: asObligationId("o2"),
        engagementId,
      }),
    ];
    for (const e of events) {
      expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
      expect(Object.isFrozen(e)).toBe(true);
      expect(Object.isFrozen(e.payload)).toBe(true);
    }
  });

  it("completed payload date", () => {
    const e = EngagementCompleted.create({
      organizationId: orgId,
      engagementId,
      completedDate: new Date("2026-05-01T00:00:00.000Z"),
    });
    expect(e.payload.completedDate).toContain("2026-05-01");
  });

  it("deliverable accepted payload", () => {
    const e = DeliverableAccepted.create({
      organizationId: orgId,
      deliverableId: asDeliverableId("d9"),
      engagementId,
      status: DeliverableStatus.ACCEPTED,
    });
    expect(e.payload.status).toBe(DeliverableStatus.ACCEPTED);
    expect(e.eventType).toBe("DeliverableAccepted");
  });

  it("milestone activated payload", () => {
    const e = MilestoneActivated.create({
      organizationId: orgId,
      milestoneId: asMilestoneId("m9"),
      engagementId,
      status: MilestoneStatus.ACTIVE,
    });
    expect(e.payload.status).toBe(MilestoneStatus.ACTIVE);
  });

  it("obligation created status", () => {
    const e = ObligationCreated.create({
      organizationId: orgId,
      obligationId: asObligationId("o9"),
      engagementId,
      title: "T",
      status: ObligationStatus.PENDING,
    });
    expect(e.payload.status).toBe(ObligationStatus.PENDING);
  });
});
