import { describe, expect, it } from "vitest";
import { asContractId } from "@creative-lab/contracts";
import { asCustomerId } from "@creative-lab/crm";
import { asOrganizationId } from "@creative-lab/organization";
import { asProjectId } from "@creative-lab/projects";
import { Deliverable } from "../../aggregates/Deliverable/Deliverable.js";
import { Engagement } from "../../aggregates/Engagement/Engagement.js";
import { Milestone } from "../../aggregates/Milestone/Milestone.js";
import { Obligation } from "../../aggregates/Obligation/Obligation.js";
import { EngagementStatus } from "../../enums/EngagementStatus.js";
import { ObligationParty } from "../../enums/ObligationParty.js";
import {
  InMemoryDeliverableRepository,
  InMemoryEngagementRepository,
  InMemoryMilestoneRepository,
  InMemoryObligationRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const customerId = asCustomerId("cust-1");
const contractId = asContractId("ctr-1");
const projectId = asProjectId("proj-1");

describe("Repository contracts", () => {
  it("EngagementRepository ports", async () => {
    const repo = new InMemoryEngagementRepository();
    const e = Engagement.create({
      organizationId: orgId,
      customerId,
      contractId,
      projectId,
      engagementNumber: "REPO-1",
      startDate: new Date("2026-01-01"),
    });
    await repo.save(e);
    expect(await repo.exists(e.id)).toBe(true);
    expect((await repo.findByOrganization(orgId))[0]?.id).toBe(e.id);
    expect((await repo.findByCustomer(customerId))[0]?.id).toBe(e.id);
    expect((await repo.findByContract(contractId))[0]?.id).toBe(e.id);
    expect((await repo.findByProject(projectId))[0]?.id).toBe(e.id);
    expect((await repo.findByEngagementNumber(orgId, "REPO-1"))?.id).toBe(e.id);
    expect((await repo.findByStatus(EngagementStatus.DRAFT)).length).toBe(1);
    await repo.archive(e.id);
  });

  it("Deliverable Milestone Obligation ports", async () => {
    const eng = Engagement.create({
      organizationId: orgId,
      customerId,
      contractId,
      startDate: new Date(),
    });
    const dRepo = new InMemoryDeliverableRepository();
    const d = Deliverable.create({
      organizationId: orgId,
      engagementId: eng.id,
      title: "D",
      sequence: 1,
    });
    await dRepo.save(d);
    expect((await dRepo.findByEngagement(eng.id)).length).toBe(1);
    expect(await dRepo.exists(d.id)).toBe(true);

    const mRepo = new InMemoryMilestoneRepository();
    const m = Milestone.create({
      organizationId: orgId,
      engagementId: eng.id,
      title: "M",
      targetDate: new Date("2026-02-01"),
      sequence: 1,
    });
    await mRepo.save(m);
    expect((await mRepo.findByEngagement(eng.id)).length).toBe(1);
    m.activate();
    await mRepo.update(m);
    expect((await mRepo.findById(m.id))?.isActive).toBe(true);

    const oRepo = new InMemoryObligationRepository();
    const o = Obligation.create({
      organizationId: orgId,
      engagementId: eng.id,
      party: ObligationParty.BOTH,
      title: "O",
    });
    await oRepo.save(o);
    expect((await oRepo.findByEngagement(eng.id)).length).toBe(1);
    expect(await oRepo.exists(o.id)).toBe(true);
  });

  it("update deliverable and milestone", async () => {
    const eng = Engagement.create({
      organizationId: orgId,
      customerId,
      contractId,
      startDate: new Date(),
    });
    const dRepo = new InMemoryDeliverableRepository();
    const d = Deliverable.create({
      organizationId: orgId,
      engagementId: eng.id,
      title: "D",
      sequence: 1,
    });
    await dRepo.save(d);
    d.start();
    await dRepo.update(d);
    expect((await dRepo.findById(d.id))?.status).toBe("IN_PROGRESS");

    const mRepo = new InMemoryMilestoneRepository();
    const m = Milestone.create({
      organizationId: orgId,
      engagementId: eng.id,
      title: "M",
      targetDate: new Date("2026-02-01"),
      sequence: 1,
    });
    await mRepo.save(m);
    expect(await mRepo.exists(m.id)).toBe(true);
  });

  it("engagement findByStatus after activate", async () => {
    const repo = new InMemoryEngagementRepository();
    const e = Engagement.create({
      organizationId: orgId,
      customerId,
      contractId,
      startDate: new Date(),
    });
    e.activate();
    await repo.save(e);
    expect((await repo.findByStatus(EngagementStatus.ACTIVE)).length).toBe(1);
  });

  it("obligation update after fulfill", async () => {
    const eng = Engagement.create({
      organizationId: orgId,
      customerId,
      contractId,
      startDate: new Date(),
    });
    const oRepo = new InMemoryObligationRepository();
    const o = Obligation.create({
      organizationId: orgId,
      engagementId: eng.id,
      party: ObligationParty.ORGANIZATION,
      title: "O",
    });
    await oRepo.save(o);
    o.fulfill();
    await oRepo.update(o);
    expect((await oRepo.findById(o.id))?.isTerminal).toBe(true);
  });

  it("milestone findById after save", async () => {
    const eng = Engagement.create({
      organizationId: orgId,
      customerId,
      contractId,
      startDate: new Date(),
    });
    const mRepo = new InMemoryMilestoneRepository();
    const m = Milestone.create({
      organizationId: orgId,
      engagementId: eng.id,
      title: "Find",
      targetDate: new Date("2026-08-01"),
      sequence: 1,
    });
    await mRepo.save(m);
    expect((await mRepo.findById(m.id))?.title.value).toBe("Find");
  });
});
