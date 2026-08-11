import { describe, expect, it, beforeEach } from "vitest";
import { asContractId } from "@creative-lab/contracts";
import { asCustomerId } from "@creative-lab/crm";
import { Organization, asOrganizationId } from "@creative-lab/organization";
import { DeliverableStatus } from "../../enums/DeliverableStatus.js";
import { EngagementStatus } from "../../enums/EngagementStatus.js";
import { MilestoneStatus } from "../../enums/MilestoneStatus.js";
import { ObligationParty } from "../../enums/ObligationParty.js";
import { ObligationStatus } from "../../enums/ObligationStatus.js";
import {
  DuplicateEngagementNumberError,
  ObligationAlreadyFulfilledError,
} from "../../errors/EngagementErrors.js";
import {
  DeliverableAccepted,
  EngagementActivated,
  EngagementCompleted,
  EngagementCreated,
  MilestoneActivated,
  ObligationFulfilled,
} from "../../events/engagement-events.js";
import { DeliverableService } from "../../services/DeliverableService.js";
import { EngagementService } from "../../services/EngagementService.js";
import { MilestoneService } from "../../services/MilestoneService.js";
import { ObligationService } from "../../services/ObligationService.js";
import {
  InMemoryDeliverableRepository,
  InMemoryEngagementRepository,
  InMemoryEventPublisher,
  InMemoryMilestoneRepository,
  InMemoryObligationRepository,
  InMemoryOrganizationRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const customerId = asCustomerId("cust-1");
const contractId = asContractId("ctr-1");

describe("Engagement services", () => {
  let orgs: InMemoryOrganizationRepository;
  let engagements: InMemoryEngagementRepository;
  let deliverables: InMemoryDeliverableRepository;
  let milestones: InMemoryMilestoneRepository;
  let obligations: InMemoryObligationRepository;
  let events: InMemoryEventPublisher;
  let engagementService: EngagementService;
  let deliverableService: DeliverableService;
  let milestoneService: MilestoneService;
  let obligationService: ObligationService;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    engagements = new InMemoryEngagementRepository();
    deliverables = new InMemoryDeliverableRepository();
    milestones = new InMemoryMilestoneRepository();
    obligations = new InMemoryObligationRepository();
    events = new InMemoryEventPublisher();
    await orgs.save(
      Organization.create({ name: "Studio", slug: "studio", id: orgId }),
    );
    engagementService = new EngagementService({
      engagementRepository: engagements,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    deliverableService = new DeliverableService({
      deliverableRepository: deliverables,
      engagementRepository: engagements,
      eventPublisher: events,
    });
    milestoneService = new MilestoneService({
      milestoneRepository: milestones,
      engagementRepository: engagements,
      eventPublisher: events,
    });
    obligationService = new ObligationService({
      obligationRepository: obligations,
      engagementRepository: engagements,
      eventPublisher: events,
    });
  });

  async function createActive(number = "ENG-SVC-1") {
    const e = await engagementService.create({
      organizationId: orgId,
      customerId,
      contractId,
      engagementNumber: number,
      startDate: new Date("2026-01-01"),
      targetCompletionDate: new Date("2026-12-01"),
    });
    return engagementService.activate(e.id);
  }

  it("creates engagement", async () => {
    const e = await engagementService.create({
      organizationId: orgId,
      customerId,
      contractId,
      startDate: new Date("2026-01-01"),
    });
    expect(e.status).toBe(EngagementStatus.DRAFT);
    expect(events.events.some((ev) => ev instanceof EngagementCreated)).toBe(
      true,
    );
  });

  it("rejects duplicate number", async () => {
    await engagementService.create({
      organizationId: orgId,
      customerId,
      contractId,
      engagementNumber: "DUP",
      startDate: new Date(),
    });
    await expect(
      engagementService.create({
        organizationId: orgId,
        customerId,
        contractId,
        engagementNumber: "DUP",
        startDate: new Date(),
      }),
    ).rejects.toThrow(DuplicateEngagementNumberError);
  });

  it("activate suspend resume complete cancel archive", async () => {
    const e = await createActive("LIFE");
    expect(events.events.some((ev) => ev instanceof EngagementActivated)).toBe(
      true,
    );
    await engagementService.suspend(e.id);
    expect((await engagementService.getById(e.id)).status).toBe(
      EngagementStatus.SUSPENDED,
    );
    await engagementService.resume(e.id);
    await engagementService.complete(e.id, new Date("2026-10-01"));
    expect(events.events.some((ev) => ev instanceof EngagementCompleted)).toBe(
      true,
    );
    await engagementService.archive(e.id);
    expect((await engagementService.getById(e.id)).isArchived).toBe(true);

    const e2 = await createActive("CAN");
    await engagementService.cancel(e2.id);
    expect((await engagementService.getById(e2.id)).status).toBe(
      EngagementStatus.CANCELLED,
    );
  });

  it("deliverable full path", async () => {
    const e = await createActive("DEL");
    const d = await deliverableService.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "Final master",
    });
    await deliverableService.start(d.id);
    await deliverableService.complete(d.id);
    const accepted = await deliverableService.accept(d.id);
    expect(accepted.status).toBe(DeliverableStatus.ACCEPTED);
    expect(events.events.some((ev) => ev instanceof DeliverableAccepted)).toBe(
      true,
    );
  });

  it("reorder deliverables", async () => {
    const e = await engagementService.create({
      organizationId: orgId,
      customerId,
      contractId,
      engagementNumber: "REO",
      startDate: new Date(),
    });
    const d1 = await deliverableService.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "A",
      sequence: 1,
    });
    const d2 = await deliverableService.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "B",
      sequence: 2,
    });
    const list = await deliverableService.reorder(e.id, [d2.id, d1.id]);
    const byId = new Map(list.map((d) => [d.id, d]));
    expect(byId.get(d2.id)?.sequence).toBe(1);
    expect(byId.get(d1.id)?.sequence).toBe(2);
  });

  it("milestone activate and complete one active", async () => {
    const e = await createActive("MIL");
    const m1 = await milestoneService.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "M1",
      targetDate: new Date("2026-02-01"),
    });
    const m2 = await milestoneService.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "M2",
      targetDate: new Date("2026-03-01"),
    });
    await milestoneService.activate(m1.id);
    expect(events.events.some((ev) => ev instanceof MilestoneActivated)).toBe(
      true,
    );
    await expect(milestoneService.activate(m2.id)).rejects.toThrow();
    await milestoneService.complete(m1.id);
    expect((await milestoneService.getById(m1.id)).status).toBe(
      MilestoneStatus.COMPLETED,
    );
    await milestoneService.activate(m2.id);
  });

  it("obligation fulfill and waive", async () => {
    const e = await createActive("OBL");
    const o = await obligationService.create({
      organizationId: orgId,
      engagementId: e.id,
      party: ObligationParty.ORGANIZATION,
      title: "Deliver cuts",
    });
    await obligationService.fulfill(o.id);
    expect(events.events.some((ev) => ev instanceof ObligationFulfilled)).toBe(
      true,
    );
    expect((await obligationService.getById(o.id)).status).toBe(
      ObligationStatus.FULFILLED,
    );
    await expect(obligationService.waive(o.id)).rejects.toThrow(
      ObligationAlreadyFulfilledError,
    );

    const o2 = await obligationService.create({
      organizationId: orgId,
      engagementId: e.id,
      party: ObligationParty.CUSTOMER,
      title: "Approve",
    });
    await obligationService.waive(o2.id);
    expect((await obligationService.getById(o2.id)).status).toBe(
      ObligationStatus.WAIVED,
    );
  });

  it("list queries", async () => {
    const e = await createActive("FIND");
    expect((await engagementService.listByOrganization(orgId)).length).toBe(1);
    expect(
      (await engagementService.findByEngagementNumber(orgId, "FIND"))?.id,
    ).toBe(e.id);
    expect((await engagements.findByContract(contractId)).length).toBe(1);
    expect((await engagements.findByCustomer(customerId)).length).toBe(1);
  });

  it("cannot operate deliverables when not active", async () => {
    const e = await engagementService.create({
      organizationId: orgId,
      customerId,
      contractId,
      engagementNumber: "DRAFT-OP",
      startDate: new Date(),
    });
    const d = await deliverableService.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "D",
    });
    await expect(deliverableService.start(d.id)).rejects.toThrow();
  });

  it("list deliverables milestones obligations", async () => {
    const e = await createActive("LIST");
    await deliverableService.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "D1",
    });
    await milestoneService.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "M1",
      targetDate: new Date("2026-05-01"),
    });
    await obligationService.create({
      organizationId: orgId,
      engagementId: e.id,
      party: ObligationParty.BOTH,
      title: "O1",
    });
    expect((await deliverableService.listByEngagement(e.id)).length).toBe(1);
    expect((await milestoneService.listByEngagement(e.id)).length).toBe(1);
    expect((await obligationService.listByEngagement(e.id)).length).toBe(1);
  });

  it("cannot create deliverable on completed", async () => {
    const e = await createActive("DONE-D");
    await engagementService.complete(e.id);
    await expect(
      deliverableService.create({
        organizationId: orgId,
        engagementId: e.id,
        title: "Late",
      }),
    ).rejects.toThrow();
  });

  it("duplicate deliverable sequence rejected", async () => {
    const e = await engagementService.create({
      organizationId: orgId,
      customerId,
      contractId,
      engagementNumber: "SEQ-D",
      startDate: new Date(),
    });
    await deliverableService.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "A",
      sequence: 1,
    });
    await expect(
      deliverableService.create({
        organizationId: orgId,
        engagementId: e.id,
        title: "B",
        sequence: 1,
      }),
    ).rejects.toThrow();
  });

  it("milestone chronological rejection", async () => {
    const e = await engagementService.create({
      organizationId: orgId,
      customerId,
      contractId,
      engagementNumber: "CHRON",
      startDate: new Date(),
    });
    await milestoneService.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "M1",
      targetDate: new Date("2026-06-01"),
      sequence: 1,
    });
    await expect(
      milestoneService.create({
        organizationId: orgId,
        engagementId: e.id,
        title: "M2",
        targetDate: new Date("2026-01-01"),
        sequence: 2,
      }),
    ).rejects.toThrow();
  });

  it("get by id helpers", async () => {
    const e = await createActive("GET");
    const d = await deliverableService.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "D",
    });
    const m = await milestoneService.create({
      organizationId: orgId,
      engagementId: e.id,
      title: "M",
      targetDate: new Date("2026-07-01"),
    });
    const o = await obligationService.create({
      organizationId: orgId,
      engagementId: e.id,
      party: ObligationParty.CUSTOMER,
      title: "O",
    });
    expect((await deliverableService.getById(d.id)).title.value).toBe("D");
    expect((await milestoneService.getById(m.id)).title.value).toBe("M");
    expect((await obligationService.getById(o.id)).title.value).toBe("O");
  });

  it("not found engagement", async () => {
    await expect(
      engagementService.getById("missing" as never),
    ).rejects.toThrow();
  });
});
