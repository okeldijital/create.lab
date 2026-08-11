import { describe, expect, it, beforeEach } from "vitest";
import { asEngagementId } from "@creative-lab/engagement";
import { Organization, asOrganizationId } from "@creative-lab/organization";
import { asProjectId } from "@creative-lab/projects";
import { InitiativePriority } from "../../enums/InitiativePriority.js";
import { InitiativeStatus } from "../../enums/InitiativeStatus.js";
import { MilestoneStatus } from "../../enums/MilestoneStatus.js";
import { PortfolioStatus } from "../../enums/PortfolioStatus.js";
import { ProgramStatus } from "../../enums/ProgramStatus.js";
import {
  DuplicateInitiativeTitleError,
  DuplicatePortfolioNumberError,
} from "../../errors/PortfolioErrors.js";
import {
  InitiativeCompleted,
  PortfolioActivated,
  PortfolioCreated,
  PortfolioHeld,
  PortfolioMilestoneActivated,
  ProgramCompleted,
} from "../../events/portfolio-events.js";
import { InitiativeService } from "../../services/InitiativeService.js";
import { PortfolioMilestoneService } from "../../services/PortfolioMilestoneService.js";
import { PortfolioService } from "../../services/PortfolioService.js";
import { ProgramService } from "../../services/ProgramService.js";
import {
  InMemoryEventPublisher,
  InMemoryInitiativeRepository,
  InMemoryOrganizationRepository,
  InMemoryPortfolioMilestoneRepository,
  InMemoryPortfolioRepository,
  InMemoryProgramRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");

describe("Portfolio services", () => {
  let orgs: InMemoryOrganizationRepository;
  let portfolios: InMemoryPortfolioRepository;
  let programs: InMemoryProgramRepository;
  let initiatives: InMemoryInitiativeRepository;
  let milestones: InMemoryPortfolioMilestoneRepository;
  let events: InMemoryEventPublisher;
  let portfolioService: PortfolioService;
  let programService: ProgramService;
  let initiativeService: InitiativeService;
  let milestoneService: PortfolioMilestoneService;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    portfolios = new InMemoryPortfolioRepository();
    programs = new InMemoryProgramRepository();
    initiatives = new InMemoryInitiativeRepository();
    milestones = new InMemoryPortfolioMilestoneRepository();
    events = new InMemoryEventPublisher();
    await orgs.save(
      Organization.create({ name: "Studio", slug: "studio", id: orgId }),
    );
    portfolioService = new PortfolioService({
      portfolioRepository: portfolios,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    programService = new ProgramService({
      programRepository: programs,
      portfolioRepository: portfolios,
      eventPublisher: events,
    });
    initiativeService = new InitiativeService({
      initiativeRepository: initiatives,
      portfolioRepository: portfolios,
      eventPublisher: events,
    });
    milestoneService = new PortfolioMilestoneService({
      portfolioMilestoneRepository: milestones,
      portfolioRepository: portfolios,
      eventPublisher: events,
    });
  });

  async function createActive(number = "PFO-SVC-1") {
    const p = await portfolioService.create({
      organizationId: orgId,
      name: "Growth",
      portfolioNumber: number,
      startDate: new Date("2026-01-01"),
      targetEndDate: new Date("2027-01-01"),
    });
    return portfolioService.activate(p.id);
  }

  it("creates portfolio", async () => {
    const p = await portfolioService.create({
      organizationId: orgId,
      name: "Strategic",
      startDate: new Date("2026-01-01"),
    });
    expect(p.status).toBe(PortfolioStatus.DRAFT);
    expect(events.events.some((e) => e instanceof PortfolioCreated)).toBe(
      true,
    );
  });

  it("rejects duplicate number", async () => {
    await portfolioService.create({
      organizationId: orgId,
      name: "A",
      portfolioNumber: "DUP",
      startDate: new Date(),
    });
    await expect(
      portfolioService.create({
        organizationId: orgId,
        name: "B",
        portfolioNumber: "DUP",
        startDate: new Date(),
      }),
    ).rejects.toThrow(DuplicatePortfolioNumberError);
  });

  it("activate hold resume complete cancel archive", async () => {
    const p = await createActive("LIFE");
    expect(events.events.some((e) => e instanceof PortfolioActivated)).toBe(
      true,
    );
    await portfolioService.hold(p.id);
    expect(events.events.some((e) => e instanceof PortfolioHeld)).toBe(true);
    await portfolioService.resume(p.id);
    await portfolioService.complete(p.id, new Date("2026-11-01"));
    await portfolioService.archive(p.id);
    expect((await portfolioService.getById(p.id)).isArchived).toBe(true);

    const p2 = await createActive("CAN");
    await portfolioService.cancel(p2.id);
    expect((await portfolioService.getById(p2.id)).status).toBe(
      PortfolioStatus.CANCELLED,
    );
  });

  it("program create activate complete with links", async () => {
    const p = await createActive("PROG");
    const program = await programService.create({
      organizationId: orgId,
      portfolioId: p.id,
      name: "Wave 1",
    });
    expect(program.status).toBe(ProgramStatus.PLANNED);
    await programService.addEngagement(program.id, asEngagementId("e1"));
    await programService.addProject(program.id, asProjectId("pr1"));
    expect(
      (await programService.getById(program.id)).engagementIds.length,
    ).toBe(1);
    await programService.removeEngagement(program.id, asEngagementId("e1"));
    await programService.removeProject(program.id, asProjectId("pr1"));
    await programService.activate(program.id);
    await programService.complete(program.id);
    expect(events.events.some((e) => e instanceof ProgramCompleted)).toBe(
      true,
    );
    await programService.archive(program.id);
    expect((await programService.getById(program.id)).isArchived).toBe(true);
  });

  it("initiative lifecycle and unique title", async () => {
    const p = await createActive("INIT");
    const init = await initiativeService.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "APAC expansion",
      priority: InitiativePriority.CRITICAL,
    });
    await expect(
      initiativeService.create({
        organizationId: orgId,
        portfolioId: p.id,
        title: "apac expansion",
      }),
    ).rejects.toThrow(DuplicateInitiativeTitleError);
    await initiativeService.activate(init.id);
    await initiativeService.complete(init.id);
    expect(events.events.some((e) => e instanceof InitiativeCompleted)).toBe(
      true,
    );
    expect((await initiativeService.getById(init.id)).status).toBe(
      InitiativeStatus.COMPLETED,
    );

    const init2 = await initiativeService.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "Other",
    });
    await initiativeService.cancel(init2.id);
    expect((await initiativeService.getById(init2.id)).status).toBe(
      InitiativeStatus.CANCELLED,
    );
  });

  it("milestone activate complete one active", async () => {
    const p = await createActive("MS");
    const m1 = await milestoneService.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "Gate 1",
      targetDate: new Date("2026-03-01"),
    });
    const m2 = await milestoneService.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "Gate 2",
      targetDate: new Date("2026-06-01"),
    });
    await milestoneService.activate(m1.id);
    expect(
      events.events.some((e) => e instanceof PortfolioMilestoneActivated),
    ).toBe(true);
    await expect(milestoneService.activate(m2.id)).rejects.toThrow();
    await milestoneService.complete(m1.id);
    expect((await milestoneService.getById(m1.id)).status).toBe(
      MilestoneStatus.COMPLETED,
    );
    await milestoneService.activate(m2.id);
  });

  it("list queries", async () => {
    const p = await createActive("FIND");
    await programService.create({
      organizationId: orgId,
      portfolioId: p.id,
      name: "P1",
    });
    await initiativeService.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "I1",
    });
    await milestoneService.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "M1",
      targetDate: new Date("2026-05-01"),
    });
    expect((await portfolioService.listByOrganization(orgId)).length).toBe(1);
    expect(
      (await portfolioService.findByPortfolioNumber(orgId, "FIND"))?.id,
    ).toBe(p.id);
    expect((await programService.listByPortfolio(p.id)).length).toBe(1);
    expect((await initiativeService.listByPortfolio(p.id)).length).toBe(1);
    expect((await milestoneService.listByPortfolio(p.id)).length).toBe(1);
  });

  it("duplicate program sequence rejected", async () => {
    const p = await createActive("SEQ");
    await programService.create({
      organizationId: orgId,
      portfolioId: p.id,
      name: "A",
      sequence: 1,
    });
    await expect(
      programService.create({
        organizationId: orgId,
        portfolioId: p.id,
        name: "B",
        sequence: 1,
      }),
    ).rejects.toThrow();
  });

  it("cannot create program on completed portfolio", async () => {
    const p = await createActive("DONE");
    await portfolioService.complete(p.id);
    await expect(
      programService.create({
        organizationId: orgId,
        portfolioId: p.id,
        name: "Late",
      }),
    ).rejects.toThrow();
  });

  it("milestone chronological rejection", async () => {
    const p = await createActive("CHRON");
    await milestoneService.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "M1",
      targetDate: new Date("2026-06-01"),
      sequence: 1,
    });
    await expect(
      milestoneService.create({
        organizationId: orgId,
        portfolioId: p.id,
        title: "M2",
        targetDate: new Date("2026-01-01"),
        sequence: 2,
      }),
    ).rejects.toThrow();
  });

  it("get by id helpers", async () => {
    const p = await createActive("GET");
    const prog = await programService.create({
      organizationId: orgId,
      portfolioId: p.id,
      name: "Prog",
    });
    const init = await initiativeService.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "Init",
    });
    const m = await milestoneService.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "M",
      targetDate: new Date("2026-07-01"),
    });
    expect((await programService.getById(prog.id)).name.value).toBe("Prog");
    expect((await initiativeService.getById(init.id)).title.value).toBe(
      "Init",
    );
    expect((await milestoneService.getById(m.id)).title.value).toBe("M");
  });

  it("not found portfolio", async () => {
    await expect(
      portfolioService.getById("missing" as never),
    ).rejects.toThrow();
  });

  it("cannot activate milestone when portfolio not active", async () => {
    const p = await portfolioService.create({
      organizationId: orgId,
      name: "Draft",
      portfolioNumber: "DRAFT-M",
      startDate: new Date(),
    });
    const m = await milestoneService.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "M",
      targetDate: new Date("2026-08-01"),
    });
    await expect(milestoneService.activate(m.id)).rejects.toThrow();
  });

  it("program activate without complete", async () => {
    const p = await createActive("PACT");
    const prog = await programService.create({
      organizationId: orgId,
      portfolioId: p.id,
      name: "Only active",
    });
    await programService.activate(prog.id);
    expect((await programService.getById(prog.id)).status).toBe(
      ProgramStatus.ACTIVE,
    );
  });

  it("initiative activate only", async () => {
    const p = await createActive("IACT");
    const init = await initiativeService.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "Live",
    });
    await initiativeService.activate(init.id);
    expect((await initiativeService.getById(init.id)).status).toBe(
      InitiativeStatus.ACTIVE,
    );
  });

  it("milestone complete after activate", async () => {
    const p = await createActive("MC");
    const m = await milestoneService.create({
      organizationId: orgId,
      portfolioId: p.id,
      title: "Done gate",
      targetDate: new Date("2026-09-01"),
    });
    await milestoneService.activate(m.id);
    await milestoneService.complete(m.id);
    expect((await milestoneService.getById(m.id)).isCompleted).toBe(true);
  });
});
