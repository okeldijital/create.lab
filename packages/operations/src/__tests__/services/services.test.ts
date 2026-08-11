import { describe, expect, it, beforeEach } from "vitest";
import { asAllocationId } from "../../types/ids.js";
import { Organization, asOrganizationId } from "@creative-lab/organization";
import { asBookingId } from "@creative-lab/scheduling";
import { WorkOrderStatus } from "../../enums/WorkOrderStatus.js";
import { OutputType } from "../../enums/OutputType.js";
import { OutputStatus } from "../../enums/OutputStatus.js";
import { IncidentType } from "../../enums/IncidentType.js";
import { IncidentSeverity } from "../../enums/IncidentSeverity.js";
import {
  DuplicateMilestoneError,
  SessionOverlapError,
  WorkOrderNotFoundError,
} from "../../errors/OperationsErrors.js";
import {
  IncidentReported,
  IncidentResolved,
  MilestoneCompleted,
  OutputApproved,
  OutputCreated,
  SessionEnded,
  SessionStarted,
  WorkOrderCreated,
  WorkStarted,
  WorkCompleted,
  WorkClosed,
} from "../../events/operations-events.js";
import { IncidentService } from "../../services/IncidentService.js";
import { MilestoneService } from "../../services/MilestoneService.js";
import { OutputService } from "../../services/OutputService.js";
import { WorkOrderService } from "../../services/WorkOrderService.js";
import { WorkSessionService } from "../../services/WorkSessionService.js";
import {
  InMemoryEventPublisher,
  InMemoryOrganizationRepository,
  InMemoryWorkIncidentRepository,
  InMemoryWorkMilestoneRepository,
  InMemoryWorkOrderRepository,
  InMemoryWorkOutputRepository,
  InMemoryWorkSessionRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const allocationId = asAllocationId("alloc-1");
const bookingId = asBookingId("booking-1");

describe("Operations services", () => {
  let orgs: InMemoryOrganizationRepository;
  let orders: InMemoryWorkOrderRepository;
  let sessions: InMemoryWorkSessionRepository;
  let milestones: InMemoryWorkMilestoneRepository;
  let outputs: InMemoryWorkOutputRepository;
  let incidents: InMemoryWorkIncidentRepository;
  let events: InMemoryEventPublisher;
  let workOrderService: WorkOrderService;
  let sessionService: WorkSessionService;
  let milestoneService: MilestoneService;
  let outputService: OutputService;
  let incidentService: IncidentService;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    orders = new InMemoryWorkOrderRepository();
    sessions = new InMemoryWorkSessionRepository();
    milestones = new InMemoryWorkMilestoneRepository();
    outputs = new InMemoryWorkOutputRepository();
    incidents = new InMemoryWorkIncidentRepository();
    events = new InMemoryEventPublisher();

    const org = Organization.create({
      name: "Studio One",
      slug: "studio-one",
      id: orgId,
    });
    await orgs.save(org);

    workOrderService = new WorkOrderService({
      workOrderRepository: orders,
      organizationRepository: orgs,
      eventPublisher: events,
      allocationExists: async () => true,
      bookingExists: async () => true,
    });
    sessionService = new WorkSessionService({
      workSessionRepository: sessions,
      workOrderRepository: orders,
      eventPublisher: events,
    });
    milestoneService = new MilestoneService({
      workMilestoneRepository: milestones,
      workOrderRepository: orders,
      eventPublisher: events,
    });
    outputService = new OutputService({
      workOutputRepository: outputs,
      workOrderRepository: orders,
      eventPublisher: events,
    });
    incidentService = new IncidentService({
      workIncidentRepository: incidents,
      workOrderRepository: orders,
      eventPublisher: events,
    });
  });

  async function createActiveOrder() {
    const order = await workOrderService.create({
      organizationId: orgId,
      allocationId,
      bookingId,
      title: "Mastering WO",
      plannedStart: new Date("2026-08-01T09:00:00Z"),
      plannedEnd: new Date("2026-08-01T17:00:00Z"),
    });
    await workOrderService.start(order.id, new Date("2026-08-01T10:00:00Z"));
    return order;
  }

  it("orchestrates full work lifecycle with events", async () => {
    const order = await workOrderService.create({
      organizationId: orgId,
      allocationId,
      bookingId,
      title: "Recording WO",
      plannedStart: new Date("2026-08-01T09:00:00Z"),
      plannedEnd: new Date("2026-08-01T17:00:00Z"),
    });
    expect(order.status).toBe(WorkOrderStatus.CREATED);
    expect(events.events.some((e) => e instanceof WorkOrderCreated)).toBe(true);

    await workOrderService.markReady(order.id);
    await workOrderService.start(order.id, new Date("2026-08-01T10:00:00Z"));
    expect(events.events.some((e) => e instanceof WorkStarted)).toBe(true);

    await workOrderService.complete(
      order.id,
      new Date("2026-08-01T16:00:00Z"),
    );
    expect(events.events.some((e) => e instanceof WorkCompleted)).toBe(true);

    await workOrderService.close(order.id);
    expect(events.events.some((e) => e instanceof WorkClosed)).toBe(true);
    const closed = await workOrderService.getById(order.id);
    expect(closed.status).toBe(WorkOrderStatus.CLOSED);
  });

  it("manages sessions with overlap rejection", async () => {
    const order = await createActiveOrder();
    const s1 = await sessionService.start({
      organizationId: orgId,
      workOrderId: order.id,
      startedAt: new Date("2026-08-01T10:00:00Z"),
    });
    expect(events.events.some((e) => e instanceof SessionStarted)).toBe(true);

    await expect(
      sessionService.start({
        organizationId: orgId,
        workOrderId: order.id,
        startedAt: new Date("2026-08-01T10:30:00Z"),
        now: new Date("2026-08-01T10:30:00Z"),
      }),
    ).rejects.toThrow(SessionOverlapError);

    await sessionService.end(s1.id, new Date("2026-08-01T12:00:00Z"));
    expect(events.events.some((e) => e instanceof SessionEnded)).toBe(true);

    const s2 = await sessionService.start({
      organizationId: orgId,
      workOrderId: order.id,
      startedAt: new Date("2026-08-01T12:00:00Z"),
      now: new Date("2026-08-01T12:00:00Z"),
    });
    expect(s2.workOrderId).toBe(order.id);
  });

  it("enforces unique milestones and completion event", async () => {
    const order = await createActiveOrder();
    const m = await milestoneService.create({
      organizationId: orgId,
      workOrderId: order.id,
      name: "Recording Complete",
    });
    await expect(
      milestoneService.create({
        organizationId: orgId,
        workOrderId: order.id,
        name: "recording complete",
      }),
    ).rejects.toThrow(DuplicateMilestoneError);

    await milestoneService.complete(m.id, "engineer-1");
    expect(events.events.some((e) => e instanceof MilestoneCompleted)).toBe(
      true,
    );
  });

  it("auto-versions outputs and approves", async () => {
    const order = await createActiveOrder();
    const o1 = await outputService.create({
      organizationId: orgId,
      workOrderId: order.id,
      name: "Mix",
      outputType: OutputType.AUDIO,
    });
    expect(o1.version.value).toBe(1);
    const o2 = await outputService.create({
      organizationId: orgId,
      workOrderId: order.id,
      name: "Mix",
      outputType: OutputType.AUDIO,
    });
    expect(o2.version.value).toBe(2);
    expect(events.events.filter((e) => e instanceof OutputCreated)).toHaveLength(
      2,
    );

    await outputService.submitForReview(o1.id);
    await outputService.approve(o1.id);
    expect(events.events.some((e) => e instanceof OutputApproved)).toBe(true);
    const approved = await outputService.getById(o1.id);
    expect(approved.status).toBe(OutputStatus.APPROVED);
  });

  it("reports and resolves incidents with audit trail", async () => {
    const order = await createActiveOrder();
    const incident = await incidentService.report({
      organizationId: orgId,
      workOrderId: order.id,
      incidentType: IncidentType.RESOURCE,
      severity: IncidentSeverity.MEDIUM,
      description: "Resource absent",
    });
    expect(events.events.some((e) => e instanceof IncidentReported)).toBe(true);
    await incidentService.resolve(incident.id, "Backup engineer assigned");
    expect(events.events.some((e) => e instanceof IncidentResolved)).toBe(true);
    const list = await incidentService.listByWorkOrder(order.id);
    expect(list).toHaveLength(1);
    expect(list[0]!.resolved).toBe(true);
  });

  it("throws WorkOrderNotFoundError", async () => {
    await expect(
      workOrderService.getById("missing" as never),
    ).rejects.toThrow(WorkOrderNotFoundError);
  });
});
