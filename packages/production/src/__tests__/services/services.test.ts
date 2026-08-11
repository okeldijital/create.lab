import { describe, expect, it, beforeEach } from "vitest";
import { Organization, asOrganizationId } from "@creative-lab/organization";
import { asWorkOrderId } from "@creative-lab/operations";
import { asProjectId } from "@creative-lab/projects";
import { MilestoneStatus } from "../../enums/MilestoneStatus.js";
import { ProductionStatus } from "../../enums/ProductionStatus.js";
import { RevisionStatus } from "../../enums/RevisionStatus.js";
import { SessionStatus } from "../../enums/SessionStatus.js";
import {
  DuplicateProductionError,
  MilestoneSequenceError,
  SessionAlreadyOpenError,
} from "../../errors/ProductionErrors.js";
import {
  MilestoneCompleted,
  ProductionArchived,
  ProductionCompleted,
  ProductionCreated,
  ProductionStarted,
  RevisionRequested,
  SessionCompleted,
  SessionOpened,
} from "../../events/production-events.js";
import { MilestoneService } from "../../services/MilestoneService.js";
import { ProductionService } from "../../services/ProductionService.js";
import { RevisionService } from "../../services/RevisionService.js";
import { SessionService } from "../../services/SessionService.js";
import {
  InMemoryEventPublisher,
  InMemoryMilestoneRepository,
  InMemoryOrganizationRepository,
  InMemoryProductionRepository,
  InMemoryRevisionRepository,
  InMemorySessionRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const workOrderId = asWorkOrderId("wo-1");

describe("Production services", () => {
  let orgs: InMemoryOrganizationRepository;
  let productions: InMemoryProductionRepository;
  let sessions: InMemorySessionRepository;
  let milestones: InMemoryMilestoneRepository;
  let revisions: InMemoryRevisionRepository;
  let events: InMemoryEventPublisher;
  let productionService: ProductionService;
  let sessionService: SessionService;
  let milestoneService: MilestoneService;
  let revisionService: RevisionService;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    productions = new InMemoryProductionRepository();
    sessions = new InMemorySessionRepository();
    milestones = new InMemoryMilestoneRepository();
    revisions = new InMemoryRevisionRepository();
    events = new InMemoryEventPublisher();
    await orgs.save(
      Organization.create({ name: "Studio", slug: "studio", id: orgId }),
    );
    productionService = new ProductionService({
      productionRepository: productions,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    sessionService = new SessionService({
      sessionRepository: sessions,
      productionRepository: productions,
      eventPublisher: events,
    });
    milestoneService = new MilestoneService({
      milestoneRepository: milestones,
      productionRepository: productions,
      eventPublisher: events,
    });
    revisionService = new RevisionService({
      revisionRepository: revisions,
      productionRepository: productions,
      eventPublisher: events,
    });
  });

  async function activeProduction() {
    const p = await productionService.create({
      organizationId: orgId,
      projectId,
      workOrderId,
      name: "Main Production",
      ownerId: "owner-1",
    });
    await productionService.start(p.id);
    return p;
  }

  it("orchestrates production lifecycle with events", async () => {
    const p = await productionService.create({
      organizationId: orgId,
      projectId,
      workOrderId,
      name: "Website Video",
      ownerId: "o1",
    });
    expect(events.events.some((e) => e instanceof ProductionCreated)).toBe(
      true,
    );
    await productionService.start(p.id);
    expect(events.events.some((e) => e instanceof ProductionStarted)).toBe(
      true,
    );
    await productionService.pause(p.id);
    await productionService.resume(p.id);
    await productionService.complete(p.id);
    expect(events.events.some((e) => e instanceof ProductionCompleted)).toBe(
      true,
    );
    const archived = await productionService.archive(p.id);
    expect(events.events.some((e) => e instanceof ProductionArchived)).toBe(
      true,
    );
    expect(archived.status).toBe(ProductionStatus.ARCHIVED);
  });

  it("rejects duplicate production names", async () => {
    await productionService.create({
      organizationId: orgId,
      projectId,
      workOrderId,
      name: "Campaign Spot",
      ownerId: "o1",
    });
    await expect(
      productionService.create({
        organizationId: orgId,
        projectId,
        workOrderId,
        name: "campaign spot",
        ownerId: "o1",
      }),
    ).rejects.toThrow(DuplicateProductionError);
  });

  it("enforces one open session", async () => {
    const p = await activeProduction();
    const s1 = await sessionService.open({
      organizationId: orgId,
      productionId: p.id,
      startedAt: new Date("2026-08-01T10:00:00Z"),
    });
    expect(events.events.some((e) => e instanceof SessionOpened)).toBe(true);
    await expect(
      sessionService.open({
        organizationId: orgId,
        productionId: p.id,
      }),
    ).rejects.toThrow(SessionAlreadyOpenError);

    await sessionService.pause(s1.id);
    expect((await sessionService.getById(s1.id)).status).toBe(
      SessionStatus.PAUSED,
    );
    await sessionService.resume(s1.id);
    await sessionService.complete(
      s1.id,
      new Date("2026-08-01T14:00:00Z"),
    );
    expect(events.events.some((e) => e instanceof SessionCompleted)).toBe(true);

    const s2 = await sessionService.open({
      organizationId: orgId,
      productionId: p.id,
      startedAt: new Date("2026-08-01T15:00:00Z"),
    });
    expect(s2.isOpen).toBe(true);
  });

  it("enforces milestone sequencing", async () => {
    const p = await activeProduction();
    const m1 = await milestoneService.create({
      organizationId: orgId,
      productionId: p.id,
      name: "Composition",
      sequence: 1,
    });
    await expect(
      milestoneService.create({
        organizationId: orgId,
        productionId: p.id,
        name: "Delivery",
        sequence: 3,
      }),
    ).rejects.toThrow(MilestoneSequenceError);

    const m2 = await milestoneService.create({
      organizationId: orgId,
      productionId: p.id,
      name: "Recording",
      sequence: 2,
    });
    await milestoneService.activate(m1.id);
    await expect(milestoneService.activate(m2.id)).rejects.toThrow(
      MilestoneSequenceError,
    );
    await milestoneService.complete(m1.id);
    expect(events.events.some((e) => e instanceof MilestoneCompleted)).toBe(
      true,
    );
    await milestoneService.activate(m2.id);
    expect((await milestoneService.getById(m2.id)).status).toBe(
      MilestoneStatus.ACTIVE,
    );
  });

  it("auto-numbers and completes revisions", async () => {
    const p = await activeProduction();
    const r1 = await revisionService.request({
      organizationId: orgId,
      productionId: p.id,
      requestedBy: "client",
      reason: "Louder",
    });
    expect(r1.revisionNumber.value).toBe(1);
    expect(events.events.some((e) => e instanceof RevisionRequested)).toBe(
      true,
    );
    const r2 = await revisionService.request({
      organizationId: orgId,
      productionId: p.id,
      requestedBy: "client",
      reason: "Softer",
    });
    expect(r2.revisionNumber.value).toBe(2);

    await revisionService.start(r1.id);
    await revisionService.complete(r1.id);
    await revisionService.close(r1.id);
    expect((await revisionService.getById(r1.id)).status).toBe(
      RevisionStatus.CLOSED,
    );
  });

  it("lists by project and owner", async () => {
    await productionService.create({
      organizationId: orgId,
      projectId,
      workOrderId,
      name: "P1",
      ownerId: "alice",
    });
    expect((await productionService.listByProject(projectId)).length).toBe(1);
    expect((await productionService.listByOwner("alice")).length).toBe(1);
  });

  it("lists sessions and milestones by production", async () => {
    const p = await activeProduction();
    await sessionService.open({
      organizationId: orgId,
      productionId: p.id,
      startedAt: new Date("2026-08-01T09:00:00Z"),
    });
    await milestoneService.create({
      organizationId: orgId,
      productionId: p.id,
      name: "Composition",
      sequence: 1,
    });
    expect((await sessionService.listByProduction(p.id)).length).toBe(1);
    expect((await milestoneService.listByProduction(p.id)).length).toBe(1);
    expect((await revisionService.listByProduction(p.id)).length).toBe(0);
  });
});
