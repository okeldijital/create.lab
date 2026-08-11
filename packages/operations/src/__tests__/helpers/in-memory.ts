import type { AnyDomainEvent } from "@creative-lab/core";
import type { AllocationId } from "../../types/ids.js";
import type {
  OrganizationId,
  OrganizationRepository,
  OrganizationSlug,
} from "@creative-lab/organization";
import type { Organization } from "@creative-lab/organization";
import type { BookingId } from "@creative-lab/scheduling";
import type { WorkIncident } from "../../aggregates/WorkIncident/WorkIncident.js";
import type { WorkMilestone } from "../../aggregates/WorkMilestone/WorkMilestone.js";
import type { WorkOrder } from "../../aggregates/WorkOrder/WorkOrder.js";
import type { WorkOutput } from "../../aggregates/WorkOutput/WorkOutput.js";
import type { WorkSession } from "../../aggregates/WorkSession/WorkSession.js";
import { WorkOrderStatus } from "../../enums/WorkOrderStatus.js";
import { OutputStatus } from "../../enums/OutputStatus.js";
import { SessionStatus } from "../../enums/SessionStatus.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { WorkIncidentRepository } from "../../repositories/WorkIncidentRepository.js";
import type { WorkMilestoneRepository } from "../../repositories/WorkMilestoneRepository.js";
import type { WorkOrderRepository } from "../../repositories/WorkOrderRepository.js";
import type { WorkOutputRepository } from "../../repositories/WorkOutputRepository.js";
import type { WorkSessionRepository } from "../../repositories/WorkSessionRepository.js";
import type {
  WorkIncidentId,
  WorkMilestoneId,
  WorkOrderId,
  WorkOutputId,
  WorkSessionId,
} from "../../types/ids.js";

export class InMemoryEventPublisher implements DomainEventPublisher {
  readonly events: AnyDomainEvent[] = [];
  async publish(events: readonly AnyDomainEvent[]): Promise<void> {
    this.events.push(...events);
  }
}

export class InMemoryOrganizationRepository implements OrganizationRepository {
  private readonly byId = new Map<string, Organization>();
  async findById(id: OrganizationId): Promise<Organization | null> {
    return this.byId.get(id) ?? null;
  }
  async findBySlug(
    slug: OrganizationSlug | string,
  ): Promise<Organization | null> {
    const v = typeof slug === "string" ? slug : slug.value;
    for (const o of this.byId.values()) {
      if (o.slug.value === v) return o;
    }
    return null;
  }
  async findAll(): Promise<Organization[]> {
    return [...this.byId.values()];
  }
  async save(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async update(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async archive(id: OrganizationId): Promise<void> {
    void id;
  }
  async exists(id: OrganizationId): Promise<boolean> {
    return this.byId.has(id);
  }
  async existsBySlug(slug: OrganizationSlug | string): Promise<boolean> {
    return (await this.findBySlug(slug)) !== null;
  }
  async delete(id: OrganizationId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryWorkOrderRepository implements WorkOrderRepository {
  private readonly byId = new Map<string, WorkOrder>();
  private readonly archived = new Set<string>();

  async findById(id: WorkOrderId): Promise<WorkOrder | null> {
    if (this.archived.has(id)) return null;
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<WorkOrder[]> {
    return [...this.byId.values()].filter(
      (o) => o.organizationId === organizationId && !this.archived.has(o.id),
    );
  }
  async findByAllocation(
    allocationId: AllocationId,
  ): Promise<WorkOrder[]> {
    return [...this.byId.values()].filter(
      (o) => o.allocationId === allocationId && !this.archived.has(o.id),
    );
  }
  async findByBooking(bookingId: BookingId): Promise<WorkOrder[]> {
    return [...this.byId.values()].filter(
      (o) => o.bookingId === bookingId && !this.archived.has(o.id),
    );
  }
  async findActive(): Promise<WorkOrder[]> {
    return [...this.byId.values()].filter(
      (o) =>
        !this.archived.has(o.id) &&
        (o.status === WorkOrderStatus.READY ||
          o.status === WorkOrderStatus.IN_PROGRESS ||
          o.status === WorkOrderStatus.PAUSED ||
          o.status === WorkOrderStatus.CREATED),
    );
  }
  async save(order: WorkOrder): Promise<void> {
    this.byId.set(order.id, order);
  }
  async update(order: WorkOrder): Promise<void> {
    this.byId.set(order.id, order);
  }
  async archive(id: WorkOrderId): Promise<void> {
    this.archived.add(id);
  }
  async exists(id: WorkOrderId): Promise<boolean> {
    return this.byId.has(id) && !this.archived.has(id);
  }
}

export class InMemoryWorkSessionRepository implements WorkSessionRepository {
  private readonly byId = new Map<string, WorkSession>();
  private readonly archived = new Set<string>();

  async findById(id: WorkSessionId): Promise<WorkSession | null> {
    if (this.archived.has(id)) return null;
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<WorkSession[]> {
    return [...this.byId.values()].filter(
      (s) => s.organizationId === organizationId && !this.archived.has(s.id),
    );
  }
  async findByWorkOrder(workOrderId: WorkOrderId): Promise<WorkSession[]> {
    return [...this.byId.values()].filter(
      (s) => s.workOrderId === workOrderId && !this.archived.has(s.id),
    );
  }
  async findActive(): Promise<WorkSession[]> {
    return [...this.byId.values()].filter(
      (s) =>
        !this.archived.has(s.id) &&
        (s.status === SessionStatus.ACTIVE ||
          s.status === SessionStatus.PAUSED),
    );
  }
  async save(session: WorkSession): Promise<void> {
    this.byId.set(session.id, session);
  }
  async update(session: WorkSession): Promise<void> {
    this.byId.set(session.id, session);
  }
  async archive(id: WorkSessionId): Promise<void> {
    this.archived.add(id);
  }
  async exists(id: WorkSessionId): Promise<boolean> {
    return this.byId.has(id) && !this.archived.has(id);
  }
}

export class InMemoryWorkMilestoneRepository
  implements WorkMilestoneRepository
{
  private readonly byId = new Map<string, WorkMilestone>();
  private readonly archived = new Set<string>();

  async findById(id: WorkMilestoneId): Promise<WorkMilestone | null> {
    if (this.archived.has(id)) return null;
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<WorkMilestone[]> {
    return [...this.byId.values()].filter(
      (m) => m.organizationId === organizationId && !this.archived.has(m.id),
    );
  }
  async findByWorkOrder(workOrderId: WorkOrderId): Promise<WorkMilestone[]> {
    return [...this.byId.values()].filter(
      (m) => m.workOrderId === workOrderId && !this.archived.has(m.id),
    );
  }
  async findActive(): Promise<WorkMilestone[]> {
    return [...this.byId.values()].filter(
      (m) => !this.archived.has(m.id) && !m.completed,
    );
  }
  async save(m: WorkMilestone): Promise<void> {
    this.byId.set(m.id, m);
  }
  async update(m: WorkMilestone): Promise<void> {
    this.byId.set(m.id, m);
  }
  async archive(id: WorkMilestoneId): Promise<void> {
    this.archived.add(id);
  }
  async exists(id: WorkMilestoneId): Promise<boolean> {
    return this.byId.has(id) && !this.archived.has(id);
  }
}

export class InMemoryWorkOutputRepository implements WorkOutputRepository {
  private readonly byId = new Map<string, WorkOutput>();
  private readonly archived = new Set<string>();

  async findById(id: WorkOutputId): Promise<WorkOutput | null> {
    if (this.archived.has(id)) return null;
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<WorkOutput[]> {
    return [...this.byId.values()].filter(
      (o) => o.organizationId === organizationId && !this.archived.has(o.id),
    );
  }
  async findByWorkOrder(workOrderId: WorkOrderId): Promise<WorkOutput[]> {
    return [...this.byId.values()].filter(
      (o) => o.workOrderId === workOrderId && !this.archived.has(o.id),
    );
  }
  async findActive(): Promise<WorkOutput[]> {
    return [...this.byId.values()].filter(
      (o) =>
        !this.archived.has(o.id) && o.status !== OutputStatus.ARCHIVED,
    );
  }
  async save(o: WorkOutput): Promise<void> {
    this.byId.set(o.id, o);
  }
  async update(o: WorkOutput): Promise<void> {
    this.byId.set(o.id, o);
  }
  async archive(id: WorkOutputId): Promise<void> {
    this.archived.add(id);
  }
  async exists(id: WorkOutputId): Promise<boolean> {
    return this.byId.has(id) && !this.archived.has(id);
  }
}

export class InMemoryWorkIncidentRepository
  implements WorkIncidentRepository
{
  private readonly byId = new Map<string, WorkIncident>();
  private readonly archived = new Set<string>();

  async findById(id: WorkIncidentId): Promise<WorkIncident | null> {
    if (this.archived.has(id)) return null;
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<WorkIncident[]> {
    return [...this.byId.values()].filter(
      (i) => i.organizationId === organizationId && !this.archived.has(i.id),
    );
  }
  async findByWorkOrder(workOrderId: WorkOrderId): Promise<WorkIncident[]> {
    return [...this.byId.values()].filter(
      (i) => i.workOrderId === workOrderId && !this.archived.has(i.id),
    );
  }
  async findActive(): Promise<WorkIncident[]> {
    return [...this.byId.values()].filter(
      (i) => !this.archived.has(i.id) && !i.resolved,
    );
  }
  async save(i: WorkIncident): Promise<void> {
    this.byId.set(i.id, i);
  }
  async update(i: WorkIncident): Promise<void> {
    this.byId.set(i.id, i);
  }
  async archive(id: WorkIncidentId): Promise<void> {
    this.archived.add(id);
  }
  async exists(id: WorkIncidentId): Promise<boolean> {
    return this.byId.has(id) && !this.archived.has(id);
  }
}
