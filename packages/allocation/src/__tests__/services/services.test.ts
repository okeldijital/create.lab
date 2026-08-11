import { describe, expect, it, beforeEach } from "vitest";
import { Organization, asOrganizationId } from "@creative-lab/organization";
import { asWorkOrderId } from "@creative-lab/operations";
import { asProjectId } from "@creative-lab/projects";
import { AllocationStatus } from "../../enums/AllocationStatus.js";
import { ResourceType } from "../../enums/ResourceType.js";
import { ReservationStatus } from "../../enums/ReservationStatus.js";
import {
  AllocationConflictError,
  AllocationNotFoundError,
  DuplicateAllocationGroupError,
} from "../../errors/AllocationErrors.js";
import {
  AllocationActivated,
  AllocationCreated,
  AllocationGroupCreated,
  ReservationApproved,
  ReservationConverted,
  ReservationRequested,
} from "../../events/allocation-events.js";
import { AllocationGroupService } from "../../services/AllocationGroupService.js";
import { AllocationService } from "../../services/AllocationService.js";
import { ReservationService } from "../../services/ReservationService.js";
import {
  InMemoryAllocationGroupRepository,
  InMemoryAllocationRepository,
  InMemoryEventPublisher,
  InMemoryOrganizationRepository,
  InMemoryReservationRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const workOrderId = asWorkOrderId("wo-1");
const start = new Date("2026-08-01T09:00:00Z");
const end = new Date("2026-08-01T17:00:00Z");

describe("Allocation services", () => {
  let orgs: InMemoryOrganizationRepository;
  let allocations: InMemoryAllocationRepository;
  let groups: InMemoryAllocationGroupRepository;
  let reservations: InMemoryReservationRepository;
  let events: InMemoryEventPublisher;
  let allocationService: AllocationService;
  let groupService: AllocationGroupService;
  let reservationService: ReservationService;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    allocations = new InMemoryAllocationRepository();
    groups = new InMemoryAllocationGroupRepository();
    reservations = new InMemoryReservationRepository();
    events = new InMemoryEventPublisher();
    await orgs.save(
      Organization.create({ name: "Studio", slug: "studio", id: orgId }),
    );
    allocationService = new AllocationService({
      allocationRepository: allocations,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    groupService = new AllocationGroupService({
      allocationGroupRepository: groups,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    reservationService = new ReservationService({
      reservationRepository: reservations,
      allocationRepository: allocations,
      organizationRepository: orgs,
      eventPublisher: events,
    });
  });

  it("creates and activates allocation", async () => {
    const a = await allocationService.create({
      organizationId: orgId,
      projectId,
      workOrderId,
      resourceId: "worker-1",
      resourceType: ResourceType.WORKER,
      allocationPercentage: 80,
      startDate: start,
      endDate: end,
    });
    expect(events.events.some((e) => e instanceof AllocationCreated)).toBe(
      true,
    );
    await allocationService.activate(a.id);
    expect(events.events.some((e) => e instanceof AllocationActivated)).toBe(
      true,
    );
    const active = await allocationService.getById(a.id);
    expect(active.status).toBe(AllocationStatus.ACTIVE);
  });

  it("rejects overlapping allocations", async () => {
    await allocationService.create({
      organizationId: orgId,
      projectId,
      workOrderId,
      resourceId: "worker-1",
      resourceType: ResourceType.WORKER,
      allocationPercentage: 50,
      startDate: start,
      endDate: end,
    });
    await expect(
      allocationService.create({
        organizationId: orgId,
        projectId,
        workOrderId: asWorkOrderId("wo-2"),
        resourceId: "worker-1",
        resourceType: ResourceType.WORKER,
        allocationPercentage: 50,
        startDate: new Date("2026-08-01T12:00:00Z"),
        endDate: new Date("2026-08-01T20:00:00Z"),
      }),
    ).rejects.toThrow(AllocationConflictError);
  });

  it("completes and cancels allocations", async () => {
    const a = await allocationService.create({
      organizationId: orgId,
      projectId,
      workOrderId,
      resourceId: "team-1",
      resourceType: ResourceType.TEAM,
      allocationPercentage: 100,
      startDate: start,
      endDate: end,
    });
    await allocationService.activate(a.id);
    await allocationService.complete(a.id);
    expect((await allocationService.getById(a.id)).status).toBe(
      AllocationStatus.COMPLETED,
    );

    const b = await allocationService.create({
      organizationId: orgId,
      projectId,
      workOrderId: asWorkOrderId("wo-x"),
      resourceId: "eq-1",
      resourceType: ResourceType.EQUIPMENT,
      allocationPercentage: 25,
      startDate: start,
      endDate: end,
    });
    await allocationService.cancel(b.id);
    expect((await allocationService.getById(b.id)).status).toBe(
      AllocationStatus.CANCELLED,
    );
  });

  it("archives allocation immutably", async () => {
    const a = await allocationService.create({
      organizationId: orgId,
      projectId,
      workOrderId,
      resourceId: "studio-1",
      resourceType: ResourceType.STUDIO,
      allocationPercentage: 100,
      startDate: start,
      endDate: end,
    });
    await allocationService.activate(a.id);
    await allocationService.complete(a.id);
    await allocationService.archive(a.id);
    await expect(allocationService.activate(a.id)).rejects.toThrow();
  });

  it("manages groups", async () => {
    const g = await groupService.create({
      organizationId: orgId,
      name: "Campaign",
    });
    expect(events.events.some((e) => e instanceof AllocationGroupCreated)).toBe(
      true,
    );
    const a = await allocationService.create({
      organizationId: orgId,
      projectId,
      workOrderId,
      resourceId: "w1",
      resourceType: ResourceType.WORKER,
      allocationPercentage: 40,
      startDate: start,
      endDate: end,
    });
    await groupService.addAllocation(g.id, a.id);
    expect((await groupService.getById(g.id)).contains(a.id)).toBe(true);
    await groupService.removeAllocation(g.id, a.id);
    await groupService.rename(g.id, "Campaign v2");
    await expect(
      groupService.create({ organizationId: orgId, name: "campaign v2" }),
    ).rejects.toThrow(DuplicateAllocationGroupError);
    await groupService.archive(g.id);
  });

  it("converts reservation to allocation with dual events", async () => {
    const r = await reservationService.request({
      organizationId: orgId,
      resourceId: "worker-9",
      projectId,
      requestedBy: "pm-1",
      reservedFrom: start,
      reservedUntil: end,
    });
    expect(events.events.some((e) => e instanceof ReservationRequested)).toBe(
      true,
    );
    await reservationService.approve(r.id);
    expect(events.events.some((e) => e instanceof ReservationApproved)).toBe(
      true,
    );

    const { reservation, allocation } = await reservationService.convert(
      r.id,
      {
        workOrderId,
        resourceType: ResourceType.WORKER,
        allocationPercentage: 60,
      },
    );
    expect(reservation.status).toBe(ReservationStatus.CONVERTED);
    expect(allocation.status).toBe(AllocationStatus.PLANNED);
    expect(events.events.some((e) => e instanceof ReservationConverted)).toBe(
      true,
    );
    expect(
      events.events.filter((e) => e instanceof AllocationCreated).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("cancels reservation", async () => {
    const r = await reservationService.request({
      organizationId: orgId,
      resourceId: "w2",
      projectId,
      requestedBy: "u1",
      reservedFrom: start,
      reservedUntil: end,
    });
    await reservationService.cancel(r.id);
    expect((await reservationService.getById(r.id)).status).toBe(
      ReservationStatus.CANCELLED,
    );
  });

  it("throws AllocationNotFoundError", async () => {
    await expect(
      allocationService.getById("missing" as never),
    ).rejects.toThrow(AllocationNotFoundError);
  });
});
