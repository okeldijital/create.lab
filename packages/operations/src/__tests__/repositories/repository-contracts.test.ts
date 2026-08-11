import { describe, expect, it } from "vitest";
import { asAllocationId } from "../../types/ids.js";
import { asOrganizationId } from "@creative-lab/organization";
import { asBookingId } from "@creative-lab/scheduling";
import { WorkIncident } from "../../aggregates/WorkIncident/WorkIncident.js";
import { WorkMilestone } from "../../aggregates/WorkMilestone/WorkMilestone.js";
import { WorkOrder } from "../../aggregates/WorkOrder/WorkOrder.js";
import { WorkOutput } from "../../aggregates/WorkOutput/WorkOutput.js";
import { WorkSession } from "../../aggregates/WorkSession/WorkSession.js";
import { IncidentSeverity } from "../../enums/IncidentSeverity.js";
import { IncidentType } from "../../enums/IncidentType.js";
import { OutputType } from "../../enums/OutputType.js";
import {
  InMemoryWorkIncidentRepository,
  InMemoryWorkMilestoneRepository,
  InMemoryWorkOrderRepository,
  InMemoryWorkOutputRepository,
  InMemoryWorkSessionRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const allocationId = asAllocationId("alloc-1");
const bookingId = asBookingId("booking-1");

describe("Repository contracts (in-memory ports)", () => {
  it("WorkOrderRepository finders and archive", async () => {
    const repo = new InMemoryWorkOrderRepository();
    const order = WorkOrder.create({
      organizationId: orgId,
      allocationId,
      bookingId,
      title: "WO",
      plannedStart: new Date("2026-08-01T09:00:00Z"),
      plannedEnd: new Date("2026-08-01T17:00:00Z"),
    });
    await repo.save(order);
    expect(await repo.exists(order.id)).toBe(true);
    expect((await repo.findByAllocation(allocationId))[0]?.id).toBe(order.id);
    expect((await repo.findByBooking(bookingId))[0]?.id).toBe(order.id);
    expect((await repo.findByOrganization(orgId)).length).toBe(1);
    expect((await repo.findActive()).length).toBe(1);
    await repo.archive(order.id);
    expect(await repo.findById(order.id)).toBeNull();
    expect(await repo.exists(order.id)).toBe(false);
  });

  it("child repos scoped by work order", async () => {
    const order = WorkOrder.create({
      organizationId: orgId,
      allocationId,
      bookingId,
      title: "WO",
      plannedStart: new Date("2026-08-01T09:00:00Z"),
      plannedEnd: new Date("2026-08-01T17:00:00Z"),
    });

    const sessionRepo = new InMemoryWorkSessionRepository();
    const session = WorkSession.create({
      organizationId: orgId,
      workOrderId: order.id,
    });
    await sessionRepo.save(session);
    expect((await sessionRepo.findByWorkOrder(order.id)).length).toBe(1);
    expect((await sessionRepo.findActive()).length).toBe(1);

    const milestoneRepo = new InMemoryWorkMilestoneRepository();
    const m = WorkMilestone.create({
      organizationId: orgId,
      workOrderId: order.id,
      name: "Done",
    });
    await milestoneRepo.save(m);
    expect((await milestoneRepo.findActive()).length).toBe(1);

    const outputRepo = new InMemoryWorkOutputRepository();
    const out = WorkOutput.create({
      organizationId: orgId,
      workOrderId: order.id,
      name: "Mix",
      outputType: OutputType.AUDIO,
    });
    await outputRepo.save(out);
    expect((await outputRepo.findByWorkOrder(order.id)).length).toBe(1);

    const incidentRepo = new InMemoryWorkIncidentRepository();
    const incident = WorkIncident.create({
      organizationId: orgId,
      workOrderId: order.id,
      incidentType: IncidentType.OTHER,
      severity: IncidentSeverity.LOW,
      description: "Minor delay",
    });
    await incidentRepo.save(incident);
    expect((await incidentRepo.findActive()).length).toBe(1);
    incident.resolve("Fixed");
    await incidentRepo.update(incident);
    expect((await incidentRepo.findActive()).length).toBe(0);
  });
});
