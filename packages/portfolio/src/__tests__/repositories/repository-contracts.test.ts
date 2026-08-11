import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { Initiative } from "../../aggregates/Initiative/Initiative.js";
import { Portfolio } from "../../aggregates/Portfolio/Portfolio.js";
import { PortfolioMilestone } from "../../aggregates/PortfolioMilestone/PortfolioMilestone.js";
import { Program } from "../../aggregates/Program/Program.js";
import { PortfolioStatus } from "../../enums/PortfolioStatus.js";
import {
  InMemoryInitiativeRepository,
  InMemoryPortfolioMilestoneRepository,
  InMemoryPortfolioRepository,
  InMemoryProgramRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");

describe("Repository contracts", () => {
  it("PortfolioRepository ports", async () => {
    const repo = new InMemoryPortfolioRepository();
    const p = Portfolio.create({
      organizationId: orgId,
      name: "Repo",
      portfolioNumber: "REPO-1",
      startDate: new Date("2026-01-01"),
    });
    await repo.save(p);
    expect(await repo.exists(p.id)).toBe(true);
    expect((await repo.findByOrganization(orgId))[0]?.id).toBe(p.id);
    expect((await repo.findByPortfolioNumber(orgId, "REPO-1"))?.id).toBe(p.id);
    expect((await repo.findByStatus(PortfolioStatus.DRAFT)).length).toBe(1);
    p.activate();
    await repo.update(p);
    await repo.archive(p.id);
  });

  it("Program Initiative Milestone ports", async () => {
    const portfolio = Portfolio.create({
      organizationId: orgId,
      name: "P",
      startDate: new Date(),
    });
    const pRepo = new InMemoryProgramRepository();
    const program = Program.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      name: "Prog",
      sequence: 1,
    });
    await pRepo.save(program);
    expect((await pRepo.findByPortfolio(portfolio.id)).length).toBe(1);
    expect(await pRepo.exists(program.id)).toBe(true);

    const iRepo = new InMemoryInitiativeRepository();
    const init = Initiative.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      title: "Init",
    });
    await iRepo.save(init);
    expect((await iRepo.findByPortfolio(portfolio.id)).length).toBe(1);
    init.activate();
    await iRepo.update(init);
    expect((await iRepo.findById(init.id))?.status).toBe("ACTIVE");

    const mRepo = new InMemoryPortfolioMilestoneRepository();
    const m = PortfolioMilestone.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      title: "M",
      targetDate: new Date("2026-02-01"),
      sequence: 1,
    });
    await mRepo.save(m);
    expect((await mRepo.findByPortfolio(portfolio.id)).length).toBe(1);
    expect(await mRepo.exists(m.id)).toBe(true);
  });

  it("find status after activate", async () => {
    const repo = new InMemoryPortfolioRepository();
    const p = Portfolio.create({
      organizationId: orgId,
      name: "A",
      startDate: new Date(),
    });
    p.activate();
    await repo.save(p);
    expect((await repo.findByStatus(PortfolioStatus.ACTIVE)).length).toBe(1);
  });

  it("program and initiative findById", async () => {
    const portfolio = Portfolio.create({
      organizationId: orgId,
      name: "P",
      startDate: new Date(),
    });
    const pRepo = new InMemoryProgramRepository();
    const program = Program.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      name: "Find",
      sequence: 1,
    });
    await pRepo.save(program);
    expect((await pRepo.findById(program.id))?.name.value).toBe("Find");

    const iRepo = new InMemoryInitiativeRepository();
    const init = Initiative.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      title: "FindI",
    });
    await iRepo.save(init);
    expect(await iRepo.exists(init.id)).toBe(true);
  });

  it("milestone update after activate", async () => {
    const portfolio = Portfolio.create({
      organizationId: orgId,
      name: "P",
      startDate: new Date(),
    });
    const mRepo = new InMemoryPortfolioMilestoneRepository();
    const m = PortfolioMilestone.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      title: "M",
      targetDate: new Date("2026-02-01"),
      sequence: 1,
    });
    await mRepo.save(m);
    m.activate();
    await mRepo.update(m);
    expect((await mRepo.findById(m.id))?.isActive).toBe(true);
  });

  it("program update after activate", async () => {
    const portfolio = Portfolio.create({
      organizationId: orgId,
      name: "P",
      startDate: new Date(),
    });
    const pRepo = new InMemoryProgramRepository();
    const program = Program.create({
      organizationId: orgId,
      portfolioId: portfolio.id,
      name: "Up",
      sequence: 1,
    });
    await pRepo.save(program);
    program.activate();
    await pRepo.update(program);
    expect((await pRepo.findById(program.id))?.status).toBe("ACTIVE");
  });
});
