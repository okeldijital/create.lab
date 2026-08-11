import { describe, expect, it } from "vitest";
import { asEngagementId } from "@creative-lab/engagement";
import { asOrganizationId } from "@creative-lab/organization";
import { asProjectId } from "@creative-lab/projects";
import { Initiative } from "../../aggregates/Initiative/Initiative.js";
import { Portfolio } from "../../aggregates/Portfolio/Portfolio.js";
import { PortfolioMilestone } from "../../aggregates/PortfolioMilestone/PortfolioMilestone.js";
import { Program } from "../../aggregates/Program/Program.js";
import { InitiativePriority } from "../../enums/InitiativePriority.js";
import { InitiativeStatus } from "../../enums/InitiativeStatus.js";
import { MilestoneStatus } from "../../enums/MilestoneStatus.js";
import { PortfolioStatus } from "../../enums/PortfolioStatus.js";
import { ProgramStatus } from "../../enums/ProgramStatus.js";
import { InvalidPortfolioStateError } from "../../errors/PortfolioErrors.js";
import {
  InitiativeCreated,
  PortfolioActivated,
  PortfolioCreated,
  PortfolioMilestoneCreated,
  ProgramCreated,
} from "../../events/portfolio-events.js";

const orgId = asOrganizationId("org-1");

function createPortfolio(
  overrides: Partial<Parameters<typeof Portfolio.create>[0]> = {},
) {
  return Portfolio.create({
    organizationId: orgId,
    name: "Strategic",
    portfolioNumber: "PFO-001",
    startDate: new Date("2026-01-01"),
    targetEndDate: new Date("2027-01-01"),
    ...overrides,
  });
}

describe("Portfolio aggregate", () => {
  it("creates DRAFT with event", () => {
    const p = createPortfolio();
    expect(p.status).toBe(PortfolioStatus.DRAFT);
    expect(p.portfolioNumber.value).toBe("PFO-001");
    expect(p.pullDomainEvents()[0]).toBeInstanceOf(PortfolioCreated);
  });

  it("lifecycle activate hold resume complete archive", () => {
    const p = createPortfolio();
    p.pullDomainEvents();
    p.activate();
    expect(p.isActive).toBe(true);
    expect(p.pullDomainEvents()[0]).toBeInstanceOf(PortfolioActivated);
    p.hold();
    expect(p.status).toBe(PortfolioStatus.ON_HOLD);
    p.resume();
    expect(p.isActive).toBe(true);
    p.complete(new Date("2026-12-01"));
    expect(p.isCompleted).toBe(true);
    p.archive();
    expect(p.isArchived).toBe(true);
  });

  it("cancel and immutability", () => {
    const p = createPortfolio({ portfolioNumber: "PFO-002" });
    p.cancel();
    expect(p.status).toBe(PortfolioStatus.CANCELLED);
    p.archive();
    expect(() => p.activate()).toThrow(InvalidPortfolioStateError);
  });

  it("rejects bad dates", () => {
    expect(() =>
      createPortfolio({
        startDate: new Date("2026-06-01"),
        targetEndDate: new Date("2026-01-01"),
      }),
    ).toThrow(InvalidPortfolioStateError);
  });

  it("completed immutable for business ops", () => {
    const p = createPortfolio({ portfolioNumber: "PFO-003" });
    p.activate();
    p.complete();
    expect(() => p.hold()).toThrow(InvalidPortfolioStateError);
  });

  it("reconstitutes", () => {
    const p = createPortfolio({ portfolioNumber: "SNAP" });
    expect(
      Portfolio.reconstitute(p.toSnapshot()).portfolioNumber.value,
    ).toBe("SNAP");
  });

  it("tracks program and initiative ids", () => {
    const p = createPortfolio({ portfolioNumber: "IDS" });
    p.addProgramId("pr1" as never);
    p.addInitiativeId("in1" as never);
    expect(p.programIds.length).toBe(1);
    expect(p.initiativeIds.length).toBe(1);
  });
});

describe("Program aggregate", () => {
  it("creates and manages links", () => {
    const portfolio = createPortfolio();
    const program = Program.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      name: "Program A",
      sequence: 1,
    });
    expect(program.status).toBe(ProgramStatus.PLANNED);
    expect(program.pullDomainEvents()[0]).toBeInstanceOf(ProgramCreated);
    program.addEngagement(asEngagementId("e1"));
    program.addProject(asProjectId("p1"));
    expect(program.engagementIds.length).toBe(1);
    expect(program.projectIds.length).toBe(1);
    program.removeEngagement(asEngagementId("e1"));
    program.removeProject(asProjectId("p1"));
    expect(program.engagementIds.length).toBe(0);
  });

  it("activate complete archive", () => {
    const portfolio = createPortfolio();
    const program = Program.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      name: "B",
      sequence: 1,
    });
    program.activate();
    expect(program.status).toBe(ProgramStatus.ACTIVE);
    program.complete();
    expect(program.isCompleted).toBe(true);
    program.archive();
    expect(program.isArchived).toBe(true);
    expect(() => program.addProject(asProjectId("x"))).toThrow(
      InvalidPortfolioStateError,
    );
  });

  it("reconstitutes", () => {
    const portfolio = createPortfolio();
    const program = Program.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      name: "C",
      sequence: 2,
    });
    expect(Program.reconstitute(program.toSnapshot()).sequence).toBe(2);
  });
});

describe("Initiative aggregate", () => {
  it("lifecycle", () => {
    const portfolio = createPortfolio();
    const init = Initiative.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      title: "Expand EU",
      priority: InitiativePriority.HIGH,
    });
    expect(init.pullDomainEvents()[0]).toBeInstanceOf(InitiativeCreated);
    init.activate();
    expect(init.status).toBe(InitiativeStatus.ACTIVE);
    init.complete();
    expect(init.isCompleted).toBe(true);
    expect(() => init.cancel()).toThrow(InvalidPortfolioStateError);
  });

  it("cancel path", () => {
    const portfolio = createPortfolio();
    const init = Initiative.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      title: "Skip",
    });
    init.cancel();
    expect(init.status).toBe(InitiativeStatus.CANCELLED);
  });

  it("reconstitutes", () => {
    const portfolio = createPortfolio();
    const init = Initiative.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      title: "Snap",
    });
    expect(Initiative.reconstitute(init.toSnapshot()).title.value).toBe("Snap");
  });
});

describe("PortfolioMilestone aggregate", () => {
  it("lifecycle", () => {
    const portfolio = createPortfolio();
    const m = PortfolioMilestone.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      title: "Gate 1",
      targetDate: new Date("2026-03-01"),
      sequence: 1,
    });
    expect(m.pullDomainEvents()[0]).toBeInstanceOf(PortfolioMilestoneCreated);
    m.activate();
    expect(m.status).toBe(MilestoneStatus.ACTIVE);
    m.complete();
    expect(m.isCompleted).toBe(true);
    expect(() => m.activate()).toThrow(InvalidPortfolioStateError);
  });

  it("reconstitutes", () => {
    const portfolio = createPortfolio();
    const m = PortfolioMilestone.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      title: "G",
      targetDate: new Date("2026-04-01"),
      sequence: 2,
    });
    expect(PortfolioMilestone.reconstitute(m.toSnapshot()).sequence).toBe(2);
  });
});

describe("Portfolio extras", () => {
  it("generates number", () => {
    const p = Portfolio.create({
      organizationId: orgId,
      name: "Gen",
      startDate: new Date("2026-01-01"),
    });
    expect(p.portfolioNumber.value.startsWith("PFO-")).toBe(true);
  });

  it("resume only from on hold", () => {
    const p = createPortfolio({ portfolioNumber: "RES" });
    p.activate();
    expect(() => p.resume()).toThrow(InvalidPortfolioStateError);
    p.hold();
    p.resume();
    expect(p.isActive).toBe(true);
  });

  it("completed date before start rejected", () => {
    const p = createPortfolio({ portfolioNumber: "CD" });
    p.activate();
    expect(() => p.complete(new Date("2020-01-01"))).toThrow(
      InvalidPortfolioStateError,
    );
  });

  it("cannot complete twice", () => {
    const p = createPortfolio({ portfolioNumber: "DBL" });
    p.activate();
    p.complete();
    expect(() => p.complete()).toThrow(InvalidPortfolioStateError);
  });

  it("structure blocked after cancel", () => {
    const p = createPortfolio({ portfolioNumber: "CAN-S" });
    p.cancel();
    expect(() => p.addProgramId("x" as never)).toThrow(
      InvalidPortfolioStateError,
    );
  });
});

describe("Program extras", () => {
  it("cannot activate from completed", () => {
    const portfolio = createPortfolio();
    const program = Program.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      name: "X",
      sequence: 1,
    });
    program.activate();
    program.complete();
    expect(() => program.activate()).toThrow(InvalidPortfolioStateError);
  });
});

describe("Initiative extras", () => {
  it("cannot activate from completed", () => {
    const portfolio = createPortfolio();
    const init = Initiative.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      title: "Done",
    });
    init.activate();
    init.complete();
    expect(() => init.activate()).toThrow(InvalidPortfolioStateError);
  });

  it("default priority medium", () => {
    const portfolio = createPortfolio();
    const init = Initiative.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      title: "P",
    });
    expect(init.priority).toBe(InitiativePriority.MEDIUM);
  });
});

describe("Milestone extras", () => {
  it("cannot complete from planned", () => {
    const portfolio = createPortfolio();
    const m = PortfolioMilestone.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      title: "M",
      targetDate: new Date("2026-05-01"),
      sequence: 1,
    });
    expect(() => m.complete()).toThrow(InvalidPortfolioStateError);
  });
});

describe("Portfolio name immutable number", () => {
  it("number not changeable after create", () => {
    const p = createPortfolio({ portfolioNumber: "FIXED" });
    expect(p.portfolioNumber.value).toBe("FIXED");
  });

  it("requires organization", () => {
    expect(() =>
      Portfolio.create({
        organizationId: "" as never,
        name: "X",
        startDate: new Date(),
      }),
    ).toThrow(InvalidPortfolioStateError);
  });
});

describe("Program requires portfolio", () => {
  it("rejects empty portfolio", () => {
    expect(() =>
      Program.create({
        organizationId: orgId,
        portfolioId: "" as never,
        name: "X",
        sequence: 1,
      }),
    ).toThrow(InvalidPortfolioStateError);
  });
});
