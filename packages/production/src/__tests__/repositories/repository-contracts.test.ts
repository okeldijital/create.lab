import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { asWorkOrderId } from "@creative-lab/operations";
import { asProjectId } from "@creative-lab/projects";
import { Production } from "../../aggregates/Production/Production.js";
import { ProductionMilestone } from "../../aggregates/ProductionMilestone/ProductionMilestone.js";
import { ProductionSession } from "../../aggregates/ProductionSession/ProductionSession.js";
import { Revision } from "../../aggregates/Revision/Revision.js";
import {
  InMemoryMilestoneRepository,
  InMemoryProductionRepository,
  InMemoryRevisionRepository,
  InMemorySessionRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const workOrderId = asWorkOrderId("wo-1");

describe("Repository contracts", () => {
  it("ProductionRepository ports", async () => {
    const repo = new InMemoryProductionRepository();
    const p = Production.create({
      organizationId: orgId,
      projectId,
      workOrderId,
      name: "Prod",
      ownerId: "o1",
    });
    await repo.save(p);
    expect(await repo.exists(p.id)).toBe(true);
    expect((await repo.findByProject(projectId))[0]?.id).toBe(p.id);
    expect((await repo.findByWorkOrder(workOrderId))[0]?.id).toBe(p.id);
    expect((await repo.findByOwner("o1"))[0]?.id).toBe(p.id);
    expect((await repo.findActive()).length).toBe(1);
    await repo.archive(p.id);
    expect(await repo.findById(p.id)).toBeNull();
  });

  it("SessionRepository ports", async () => {
    const prod = Production.create({
      organizationId: orgId,
      projectId,
      workOrderId,
      name: "P",
      ownerId: "o",
    });
    const repo = new InMemorySessionRepository();
    const s = ProductionSession.create({
      organizationId: orgId,
      productionId: prod.id,
    });
    await repo.save(s);
    expect((await repo.findByProduction(prod.id)).length).toBe(1);
    expect((await repo.findOpen(prod.id))?.id).toBe(s.id);
  });

  it("Milestone and Revision repository ports", async () => {
    const prod = Production.create({
      organizationId: orgId,
      projectId,
      workOrderId,
      name: "P",
      ownerId: "o",
    });
    const mRepo = new InMemoryMilestoneRepository();
    await mRepo.save(
      ProductionMilestone.create({
        organizationId: orgId,
        productionId: prod.id,
        name: "Mix",
        sequence: 1,
      }),
    );
    expect((await mRepo.findByProduction(prod.id)).length).toBe(1);

    const rRepo = new InMemoryRevisionRepository();
    const r = Revision.create({
      organizationId: orgId,
      productionId: prod.id,
      requestedBy: "c",
      revisionNumber: 1,
      reason: "fix",
    });
    await rRepo.save(r);
    await rRepo.close(r.id);
    expect((await rRepo.findByProduction(prod.id)).length).toBe(1);
  });
});
