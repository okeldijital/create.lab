import type { AnyDomainEvent } from "@creative-lab/core";
import type { ContractId } from "@creative-lab/contracts";
import type { CustomerId } from "@creative-lab/crm";
import type {
  Organization,
  OrganizationId,
  OrganizationRepository,
  OrganizationSlug,
} from "@creative-lab/organization";
import type { ProjectId } from "@creative-lab/projects";
import type { Deliverable } from "../../aggregates/Deliverable/Deliverable.js";
import type { Engagement } from "../../aggregates/Engagement/Engagement.js";
import type { Milestone } from "../../aggregates/Milestone/Milestone.js";
import type { Obligation } from "../../aggregates/Obligation/Obligation.js";
import type { EngagementStatus } from "../../enums/EngagementStatus.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { DeliverableRepository } from "../../repositories/DeliverableRepository.js";
import type { EngagementRepository } from "../../repositories/EngagementRepository.js";
import type { MilestoneRepository } from "../../repositories/MilestoneRepository.js";
import type { ObligationRepository } from "../../repositories/ObligationRepository.js";
import type {
  DeliverableId,
  EngagementId,
  MilestoneId,
  ObligationId,
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

export class InMemoryEngagementRepository implements EngagementRepository {
  private readonly byId = new Map<string, Engagement>();
  async findById(id: EngagementId): Promise<Engagement | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Engagement[]> {
    return [...this.byId.values()].filter(
      (e) => e.organizationId === organizationId,
    );
  }
  async findByCustomer(customerId: CustomerId): Promise<Engagement[]> {
    return [...this.byId.values()].filter((e) => e.customerId === customerId);
  }
  async findByContract(contractId: ContractId): Promise<Engagement[]> {
    return [...this.byId.values()].filter((e) => e.contractId === contractId);
  }
  async findByProject(projectId: ProjectId): Promise<Engagement[]> {
    return [...this.byId.values()].filter((e) => e.projectId === projectId);
  }
  async findByStatus(status: EngagementStatus): Promise<Engagement[]> {
    return [...this.byId.values()].filter((e) => e.status === status);
  }
  async findByEngagementNumber(
    organizationId: OrganizationId,
    engagementNumber: string,
  ): Promise<Engagement | null> {
    return (
      [...this.byId.values()].find(
        (e) =>
          e.organizationId === organizationId &&
          e.engagementNumber.value === engagementNumber,
      ) ?? null
    );
  }
  async save(engagement: Engagement): Promise<void> {
    this.byId.set(engagement.id, engagement);
  }
  async update(engagement: Engagement): Promise<void> {
    this.byId.set(engagement.id, engagement);
  }
  async archive(id: EngagementId): Promise<void> {
    void id;
  }
  async exists(id: EngagementId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryDeliverableRepository implements DeliverableRepository {
  private readonly byId = new Map<string, Deliverable>();
  async findById(id: DeliverableId): Promise<Deliverable | null> {
    return this.byId.get(id) ?? null;
  }
  async findByEngagement(engagementId: EngagementId): Promise<Deliverable[]> {
    return [...this.byId.values()].filter(
      (d) => d.engagementId === engagementId,
    );
  }
  async save(deliverable: Deliverable): Promise<void> {
    this.byId.set(deliverable.id, deliverable);
  }
  async update(deliverable: Deliverable): Promise<void> {
    this.byId.set(deliverable.id, deliverable);
  }
  async exists(id: DeliverableId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryMilestoneRepository implements MilestoneRepository {
  private readonly byId = new Map<string, Milestone>();
  async findById(id: MilestoneId): Promise<Milestone | null> {
    return this.byId.get(id) ?? null;
  }
  async findByEngagement(engagementId: EngagementId): Promise<Milestone[]> {
    return [...this.byId.values()].filter(
      (m) => m.engagementId === engagementId,
    );
  }
  async save(milestone: Milestone): Promise<void> {
    this.byId.set(milestone.id, milestone);
  }
  async update(milestone: Milestone): Promise<void> {
    this.byId.set(milestone.id, milestone);
  }
  async exists(id: MilestoneId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryObligationRepository implements ObligationRepository {
  private readonly byId = new Map<string, Obligation>();
  async findById(id: ObligationId): Promise<Obligation | null> {
    return this.byId.get(id) ?? null;
  }
  async findByEngagement(engagementId: EngagementId): Promise<Obligation[]> {
    return [...this.byId.values()].filter(
      (o) => o.engagementId === engagementId,
    );
  }
  async save(obligation: Obligation): Promise<void> {
    this.byId.set(obligation.id, obligation);
  }
  async update(obligation: Obligation): Promise<void> {
    this.byId.set(obligation.id, obligation);
  }
  async exists(id: ObligationId): Promise<boolean> {
    return this.byId.has(id);
  }
}
