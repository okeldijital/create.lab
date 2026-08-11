import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { asOrganizationId } from "@creative-lab/organization";
import { ProductionStatus } from "../../enums/ProductionStatus.js";
import { RevisionStatus } from "../../enums/RevisionStatus.js";
import {
  MilestoneActivated,
  MilestoneCompleted,
  MilestoneCreated,
  ProductionArchived,
  ProductionCompleted,
  ProductionCreated,
  ProductionPaused,
  ProductionResumed,
  ProductionStarted,
  RevisionClosed,
  RevisionCompleted,
  RevisionRequested,
  RevisionStarted,
  SessionCompleted,
  SessionOpened,
  SessionPaused,
  SessionResumed,
} from "../../events/production-events.js";
import {
  asProductionId,
  asProductionMilestoneId,
  asProductionSessionId,
  asRevisionId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const productionId = asProductionId("prod-1");

describe("Domain events", () => {
  it("are frozen and versioned", () => {
    const e = ProductionCreated.create({
      organizationId: orgId,
      productionId,
      projectId: "p1",
      workOrderId: "w1",
      name: "Mix",
      status: ProductionStatus.CREATED,
      ownerId: "o1",
    });
    expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(Object.isFrozen(e)).toBe(true);
    expect(Object.isFrozen(e.payload)).toBe(true);
  });

  it("covers minimum event set", () => {
    const events = [
      ProductionStarted.create({ organizationId: orgId, productionId }),
      ProductionPaused.create({ organizationId: orgId, productionId }),
      ProductionResumed.create({ organizationId: orgId, productionId }),
      ProductionCompleted.create({
        organizationId: orgId,
        productionId,
        completedAt: new Date(),
      }),
      ProductionArchived.create({ organizationId: orgId, productionId }),
      SessionOpened.create({
        organizationId: orgId,
        sessionId: asProductionSessionId("s1"),
        productionId,
        startedAt: new Date(),
      }),
      SessionPaused.create({
        organizationId: orgId,
        sessionId: asProductionSessionId("s1"),
        productionId,
      }),
      SessionResumed.create({
        organizationId: orgId,
        sessionId: asProductionSessionId("s1"),
        productionId,
      }),
      SessionCompleted.create({
        organizationId: orgId,
        sessionId: asProductionSessionId("s1"),
        productionId,
        endedAt: new Date(),
        durationMs: 1000,
      }),
      MilestoneCreated.create({
        organizationId: orgId,
        milestoneId: asProductionMilestoneId("m1"),
        productionId,
        name: "Mix",
        sequence: 1,
      }),
      MilestoneActivated.create({
        organizationId: orgId,
        milestoneId: asProductionMilestoneId("m1"),
        productionId,
        name: "Mix",
      }),
      MilestoneCompleted.create({
        organizationId: orgId,
        milestoneId: asProductionMilestoneId("m1"),
        productionId,
        name: "Mix",
      }),
      RevisionRequested.create({
        organizationId: orgId,
        revisionId: asRevisionId("r1"),
        productionId,
        revisionNumber: 1,
        status: RevisionStatus.REQUESTED,
      }),
      RevisionStarted.create({
        organizationId: orgId,
        revisionId: asRevisionId("r1"),
        productionId,
      }),
      RevisionCompleted.create({
        organizationId: orgId,
        revisionId: asRevisionId("r1"),
        productionId,
      }),
      RevisionClosed.create({
        organizationId: orgId,
        revisionId: asRevisionId("r1"),
        productionId,
      }),
    ];
    for (const e of events) {
      expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
      expect(Object.isFrozen(e)).toBe(true);
    }
  });
});
