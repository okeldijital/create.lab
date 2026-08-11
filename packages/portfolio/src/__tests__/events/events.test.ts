import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { asOrganizationId } from "@creative-lab/organization";
import { InitiativeStatus } from "../../enums/InitiativeStatus.js";
import { MilestoneStatus } from "../../enums/MilestoneStatus.js";
import { PortfolioStatus } from "../../enums/PortfolioStatus.js";
import { ProgramStatus } from "../../enums/ProgramStatus.js";
import {
  InitiativeCancelled,
  InitiativeCompleted,
  InitiativeCreated,
  PortfolioActivated,
  PortfolioArchived,
  PortfolioCancelled,
  PortfolioCompleted,
  PortfolioCreated,
  PortfolioHeld,
  PortfolioMilestoneActivated,
  PortfolioMilestoneCompleted,
  PortfolioMilestoneCreated,
  ProgramCompleted,
  ProgramCreated,
} from "../../events/portfolio-events.js";
import {
  asInitiativeId,
  asPortfolioId,
  asPortfolioMilestoneId,
  asProgramId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const portfolioId = asPortfolioId("pf1");

describe("Domain events", () => {
  it("PortfolioCreated frozen versioned", () => {
    const e = PortfolioCreated.create({
      organizationId: orgId,
      portfolioId,
      portfolioNumber: "PFO-1",
      name: "Growth",
      status: PortfolioStatus.DRAFT,
    });
    expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(Object.isFrozen(e)).toBe(true);
    expect(Object.isFrozen(e.payload)).toBe(true);
    expect(e.payload.portfolioNumber).toBe("PFO-1");
  });

  it("covers portfolio event set", () => {
    const events = [
      PortfolioActivated.create({ organizationId: orgId, portfolioId }),
      PortfolioHeld.create({ organizationId: orgId, portfolioId }),
      PortfolioCompleted.create({
        organizationId: orgId,
        portfolioId,
        completedDate: new Date(),
      }),
      PortfolioCancelled.create({ organizationId: orgId, portfolioId }),
      PortfolioArchived.create({ organizationId: orgId, portfolioId }),
      ProgramCreated.create({
        organizationId: orgId,
        programId: asProgramId("pr1"),
        portfolioId,
        name: "Prog",
        sequence: 1,
        status: ProgramStatus.PLANNED,
      }),
      ProgramCompleted.create({
        organizationId: orgId,
        programId: asProgramId("pr1"),
        portfolioId,
      }),
      InitiativeCreated.create({
        organizationId: orgId,
        initiativeId: asInitiativeId("i1"),
        portfolioId,
        title: "Init",
        status: InitiativeStatus.PLANNED,
      }),
      InitiativeCompleted.create({
        organizationId: orgId,
        initiativeId: asInitiativeId("i1"),
        portfolioId,
      }),
      InitiativeCancelled.create({
        organizationId: orgId,
        initiativeId: asInitiativeId("i2"),
        portfolioId,
      }),
      PortfolioMilestoneCreated.create({
        organizationId: orgId,
        milestoneId: asPortfolioMilestoneId("m1"),
        portfolioId,
        title: "Gate",
        sequence: 1,
      }),
      PortfolioMilestoneActivated.create({
        organizationId: orgId,
        milestoneId: asPortfolioMilestoneId("m1"),
        portfolioId,
        status: MilestoneStatus.ACTIVE,
      }),
      PortfolioMilestoneCompleted.create({
        organizationId: orgId,
        milestoneId: asPortfolioMilestoneId("m1"),
        portfolioId,
      }),
    ];
    for (const e of events) {
      expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
      expect(Object.isFrozen(e)).toBe(true);
      expect(Object.isFrozen(e.payload)).toBe(true);
    }
  });

  it("completed payload", () => {
    const e = PortfolioCompleted.create({
      organizationId: orgId,
      portfolioId,
      completedDate: new Date("2026-09-01T00:00:00.000Z"),
    });
    expect(e.payload.completedDate).toContain("2026-09-01");
  });

  it("program created sequence", () => {
    const e = ProgramCreated.create({
      organizationId: orgId,
      programId: asProgramId("pr9"),
      portfolioId,
      name: "P",
      sequence: 3,
      status: ProgramStatus.PLANNED,
    });
    expect(e.payload.sequence).toBe(3);
  });

  it("initiative cancelled type", () => {
    const e = InitiativeCancelled.create({
      organizationId: orgId,
      initiativeId: asInitiativeId("i9"),
      portfolioId,
    });
    expect(e.eventType).toBe("InitiativeCancelled");
  });

  it("milestone activated status", () => {
    const e = PortfolioMilestoneActivated.create({
      organizationId: orgId,
      milestoneId: asPortfolioMilestoneId("m9"),
      portfolioId,
      status: MilestoneStatus.ACTIVE,
    });
    expect(e.payload.status).toBe(MilestoneStatus.ACTIVE);
  });

  it("held event type", () => {
    const e = PortfolioHeld.create({
      organizationId: orgId,
      portfolioId,
    });
    expect(e.eventType).toBe("PortfolioHeld");
    expect(Object.isFrozen(e.payload)).toBe(true);
  });
});
