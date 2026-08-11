import type { AnyDomainEvent } from "@creative-lab/core";
import type {
  Organization,
  OrganizationId,
  OrganizationRepository,
  OrganizationSlug,
} from "@creative-lab/organization";
import type { WorkOrderId } from "@creative-lab/operations";
import type { ProjectId } from "@creative-lab/projects";
import type { Production } from "../../aggregates/Production/Production.js";
import type { ProductionMilestone } from "../../aggregates/ProductionMilestone/ProductionMilestone.js";
import type { ProductionSession } from "../../aggregates/ProductionSession/ProductionSession.js";
import type { Revision } from "../../aggregates/Revision/Revision.js";
import { ProductionStatus } from "../../enums/ProductionStatus.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { MilestoneRepository } from "../../repositories/MilestoneRepository.js";
import type { ProductionRepository } from "../../repositories/ProductionRepository.js";
import type { RevisionRepository } from "../../repositories/RevisionRepository.js";
import type { SessionRepository } from "../../repositories/SessionRepository.js";
import type {
  ProductionId,
  ProductionMilestoneId,
  ProductionSessionId,
  RevisionId,
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

export class InMemoryProductionRepository implements ProductionRepository {
  private readonly byId = new Map<string, Production>();
  private readonly archived = new Set<string>();

  async findById(id: ProductionId): Promise<Production | null> {
    if (this.archived.has(id)) return null;
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Production[]> {
    return [...this.byId.values()].filter(
      (p) => p.organizationId === organizationId && !this.archived.has(p.id),
    );
  }
  async findByProject(projectId: ProjectId): Promise<Production[]> {
    return [...this.byId.values()].filter(
      (p) => p.projectId === projectId && !this.archived.has(p.id),
    );
  }
  async findByWorkOrder(workOrderId: WorkOrderId): Promise<Production[]> {
    return [...this.byId.values()].filter(
      (p) => p.workOrderId === workOrderId && !this.archived.has(p.id),
    );
  }
  async findByOwner(ownerId: string): Promise<Production[]> {
    return [...this.byId.values()].filter(
      (p) => p.ownerId === ownerId && !this.archived.has(p.id),
    );
  }
  async findActive(): Promise<Production[]> {
    return [...this.byId.values()].filter(
      (p) =>
        !this.archived.has(p.id) &&
        p.status !== ProductionStatus.COMPLETED &&
        p.status !== ProductionStatus.ARCHIVED,
    );
  }
  async save(p: Production): Promise<void> {
    this.byId.set(p.id, p);
  }
  async update(p: Production): Promise<void> {
    this.byId.set(p.id, p);
  }
  async archive(id: ProductionId): Promise<void> {
    this.archived.add(id);
  }
  async exists(id: ProductionId): Promise<boolean> {
    return this.byId.has(id) && !this.archived.has(id);
  }
}

export class InMemorySessionRepository implements SessionRepository {
  private readonly byId = new Map<string, ProductionSession>();

  async findById(id: ProductionSessionId): Promise<ProductionSession | null> {
    return this.byId.get(id) ?? null;
  }
  async findByProduction(
    productionId: ProductionId,
  ): Promise<ProductionSession[]> {
    return [...this.byId.values()].filter(
      (s) => s.productionId === productionId,
    );
  }
  async findOpen(
    productionId: ProductionId,
  ): Promise<ProductionSession | null> {
    return (
      [...this.byId.values()].find(
        (s) => s.productionId === productionId && s.isOpen,
      ) ?? null
    );
  }
  async save(s: ProductionSession): Promise<void> {
    this.byId.set(s.id, s);
  }
  async update(s: ProductionSession): Promise<void> {
    this.byId.set(s.id, s);
  }
}

export class InMemoryMilestoneRepository implements MilestoneRepository {
  private readonly byId = new Map<string, ProductionMilestone>();

  async findById(
    id: ProductionMilestoneId,
  ): Promise<ProductionMilestone | null> {
    return this.byId.get(id) ?? null;
  }
  async findByProduction(
    productionId: ProductionId,
  ): Promise<ProductionMilestone[]> {
    return [...this.byId.values()].filter(
      (m) => m.productionId === productionId,
    );
  }
  async save(m: ProductionMilestone): Promise<void> {
    this.byId.set(m.id, m);
  }
  async update(m: ProductionMilestone): Promise<void> {
    this.byId.set(m.id, m);
  }
}

export class InMemoryRevisionRepository implements RevisionRepository {
  private readonly byId = new Map<string, Revision>();
  private readonly closed = new Set<string>();

  async findById(id: RevisionId): Promise<Revision | null> {
    return this.byId.get(id) ?? null;
  }
  async findByProduction(productionId: ProductionId): Promise<Revision[]> {
    return [...this.byId.values()].filter(
      (r) => r.productionId === productionId,
    );
  }
  async save(r: Revision): Promise<void> {
    this.byId.set(r.id, r);
  }
  async update(r: Revision): Promise<void> {
    this.byId.set(r.id, r);
  }
  async close(id: RevisionId): Promise<void> {
    this.closed.add(id);
  }
}
