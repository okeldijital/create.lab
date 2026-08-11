import type { AnyDomainEvent } from "@creative-lab/core";
import type {
  Organization,
  OrganizationId,
  OrganizationRepository,
  OrganizationSlug,
} from "@creative-lab/organization";
import type { Allocation } from "../../aggregates/Allocation/Allocation.js";
import type { AllocationGroup } from "../../aggregates/AllocationGroup/AllocationGroup.js";
import type { Reservation } from "../../aggregates/Reservation/Reservation.js";
import { isActiveAllocationStatus } from "../../enums/AllocationStatus.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { AllocationGroupRepository } from "../../repositories/AllocationGroupRepository.js";
import type { AllocationRepository } from "../../repositories/AllocationRepository.js";
import type { ReservationRepository } from "../../repositories/ReservationRepository.js";
import type {
  AllocationGroupId,
  AllocationId,
  ReservationId,
} from "../../types/ids.js";
import type { ProjectId } from "@creative-lab/projects";
import type { WorkOrderId } from "@creative-lab/operations";

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

export class InMemoryAllocationRepository implements AllocationRepository {
  private readonly byId = new Map<string, Allocation>();
  private readonly archived = new Set<string>();

  async findById(id: AllocationId): Promise<Allocation | null> {
    if (this.archived.has(id)) return null;
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Allocation[]> {
    return [...this.byId.values()].filter(
      (a) => a.organizationId === organizationId && !this.archived.has(a.id),
    );
  }
  async findByProject(projectId: ProjectId): Promise<Allocation[]> {
    return [...this.byId.values()].filter(
      (a) => a.projectId === projectId && !this.archived.has(a.id),
    );
  }
  async findByWorkOrder(workOrderId: WorkOrderId): Promise<Allocation[]> {
    return [...this.byId.values()].filter(
      (a) => a.workOrderId === workOrderId && !this.archived.has(a.id),
    );
  }
  async findByResource(resourceId: string): Promise<Allocation[]> {
    return [...this.byId.values()].filter(
      (a) => a.resourceId === resourceId && !this.archived.has(a.id),
    );
  }
  async findActive(): Promise<Allocation[]> {
    return [...this.byId.values()].filter(
      (a) => !this.archived.has(a.id) && isActiveAllocationStatus(a.status),
    );
  }
  async save(a: Allocation): Promise<void> {
    this.byId.set(a.id, a);
  }
  async update(a: Allocation): Promise<void> {
    this.byId.set(a.id, a);
  }
  async archive(id: AllocationId): Promise<void> {
    this.archived.add(id);
  }
  async exists(id: AllocationId): Promise<boolean> {
    return this.byId.has(id) && !this.archived.has(id);
  }
}

export class InMemoryAllocationGroupRepository
  implements AllocationGroupRepository
{
  private readonly byId = new Map<string, AllocationGroup>();
  private readonly archived = new Set<string>();

  async findById(id: AllocationGroupId): Promise<AllocationGroup | null> {
    if (this.archived.has(id)) return null;
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<AllocationGroup[]> {
    return [...this.byId.values()].filter(
      (g) => g.organizationId === organizationId && !this.archived.has(g.id),
    );
  }
  async save(g: AllocationGroup): Promise<void> {
    this.byId.set(g.id, g);
  }
  async update(g: AllocationGroup): Promise<void> {
    this.byId.set(g.id, g);
  }
  async archive(id: AllocationGroupId): Promise<void> {
    this.archived.add(id);
  }
  async exists(id: AllocationGroupId): Promise<boolean> {
    return this.byId.has(id) && !this.archived.has(id);
  }
}

export class InMemoryReservationRepository implements ReservationRepository {
  private readonly byId = new Map<string, Reservation>();
  private readonly cancelled = new Set<string>();
  private readonly converted = new Set<string>();

  async findById(id: ReservationId): Promise<Reservation | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Reservation[]> {
    return [...this.byId.values()].filter(
      (r) => r.organizationId === organizationId,
    );
  }
  async findByResource(resourceId: string): Promise<Reservation[]> {
    return [...this.byId.values()].filter((r) => r.resourceId === resourceId);
  }
  async save(r: Reservation): Promise<void> {
    this.byId.set(r.id, r);
  }
  async update(r: Reservation): Promise<void> {
    this.byId.set(r.id, r);
  }
  async cancel(id: ReservationId): Promise<void> {
    this.cancelled.add(id);
  }
  async convert(id: ReservationId): Promise<void> {
    this.converted.add(id);
  }
  async exists(id: ReservationId): Promise<boolean> {
    return this.byId.has(id);
  }
}
