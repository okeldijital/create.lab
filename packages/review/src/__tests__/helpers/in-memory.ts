import type { AnyDomainEvent } from "@creative-lab/core";
import type { AssetId } from "@creative-lab/assets";
import type {
  Organization,
  OrganizationId,
  OrganizationRepository,
  OrganizationSlug,
} from "@creative-lab/organization";
import type { ProductionId } from "@creative-lab/production";
import type { ProjectId } from "@creative-lab/projects";
import type { Approval } from "../../aggregates/Approval/Approval.js";
import type { Review } from "../../aggregates/Review/Review.js";
import type { ReviewDecision } from "../../aggregates/ReviewDecision/ReviewDecision.js";
import type { ReviewSession } from "../../aggregates/ReviewSession/ReviewSession.js";
import type { ReviewStatus } from "../../enums/ReviewStatus.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { ApprovalRepository } from "../../repositories/ApprovalRepository.js";
import type { ReviewDecisionRepository } from "../../repositories/ReviewDecisionRepository.js";
import type { ReviewRepository } from "../../repositories/ReviewRepository.js";
import type { ReviewSessionRepository } from "../../repositories/ReviewSessionRepository.js";
import type {
  ApprovalId,
  ReviewDecisionId,
  ReviewId,
  ReviewSessionId,
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

export class InMemoryReviewRepository implements ReviewRepository {
  private readonly byId = new Map<string, Review>();

  async findById(id: ReviewId): Promise<Review | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Review[]> {
    return [...this.byId.values()].filter(
      (r) => r.organizationId === organizationId,
    );
  }
  async findByProject(projectId: ProjectId): Promise<Review[]> {
    return [...this.byId.values()].filter((r) => r.projectId === projectId);
  }
  async findByProduction(productionId: ProductionId): Promise<Review[]> {
    return [...this.byId.values()].filter(
      (r) => r.productionId === productionId,
    );
  }
  async findByAsset(assetId: AssetId): Promise<Review[]> {
    return [...this.byId.values()].filter((r) => r.assetId === assetId);
  }
  async findByStatus(status: ReviewStatus): Promise<Review[]> {
    return [...this.byId.values()].filter((r) => r.status === status);
  }
  async save(r: Review): Promise<void> {
    this.byId.set(r.id, r);
  }
  async update(r: Review): Promise<void> {
    this.byId.set(r.id, r);
  }
  async archive(id: ReviewId): Promise<void> {
    void id;
  }
  async exists(id: ReviewId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryApprovalRepository implements ApprovalRepository {
  private readonly byId = new Map<string, Approval>();

  async findById(id: ApprovalId): Promise<Approval | null> {
    return this.byId.get(id) ?? null;
  }
  async findByReview(reviewId: ReviewId): Promise<Approval[]> {
    return [...this.byId.values()].filter((a) => a.reviewId === reviewId);
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Approval[]> {
    return [...this.byId.values()].filter(
      (a) => a.organizationId === organizationId,
    );
  }
  async save(a: Approval): Promise<void> {
    this.byId.set(a.id, a);
  }
  async update(a: Approval): Promise<void> {
    this.byId.set(a.id, a);
  }
  async exists(id: ApprovalId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryReviewSessionRepository
  implements ReviewSessionRepository
{
  private readonly byId = new Map<string, ReviewSession>();

  async findById(id: ReviewSessionId): Promise<ReviewSession | null> {
    return this.byId.get(id) ?? null;
  }
  async findByReview(reviewId: ReviewId): Promise<ReviewSession[]> {
    return [...this.byId.values()].filter((s) => s.reviewId === reviewId);
  }
  async findActive(reviewId: ReviewId): Promise<ReviewSession | null> {
    return (
      [...this.byId.values()].find(
        (s) => s.reviewId === reviewId && s.isActive,
      ) ?? null
    );
  }
  async save(s: ReviewSession): Promise<void> {
    this.byId.set(s.id, s);
  }
  async update(s: ReviewSession): Promise<void> {
    this.byId.set(s.id, s);
  }
}

export class InMemoryReviewDecisionRepository
  implements ReviewDecisionRepository
{
  private readonly byId = new Map<string, ReviewDecision>();

  async findById(id: ReviewDecisionId): Promise<ReviewDecision | null> {
    return this.byId.get(id) ?? null;
  }
  async findByApproval(approvalId: ApprovalId): Promise<ReviewDecision[]> {
    return [...this.byId.values()].filter((d) => d.approvalId === approvalId);
  }
  async save(d: ReviewDecision): Promise<void> {
    this.byId.set(d.id, d);
  }
  async update(d: ReviewDecision): Promise<void> {
    this.byId.set(d.id, d);
  }
}
