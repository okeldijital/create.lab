import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import type { AssetId } from "@creative-lab/assets";
import type { ProductionId } from "@creative-lab/production";
import type { ProjectId } from "@creative-lab/projects";
import {
  Review,
  type CreateReviewProps,
} from "../aggregates/Review/Review.js";
import { ReviewStatus } from "../enums/ReviewStatus.js";
import { ReviewNotFoundError } from "../errors/ReviewErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ReviewLifecyclePolicy } from "../policies/ReviewLifecyclePolicy.js";
import type { ReviewRepository } from "../repositories/ReviewRepository.js";
import type { ReviewId } from "../types/ids.js";

export type ReviewServiceDeps = {
  reviewRepository: ReviewRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class ReviewService {
  constructor(private readonly deps: ReviewServiceDeps) {}

  async create(props: CreateReviewProps): Promise<Review> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const review = Review.create(props);
    await this.deps.reviewRepository.save(review);
    await this.deps.eventPublisher.publish(review.pullDomainEvents());
    return review;
  }

  async start(id: ReviewId, now?: Date): Promise<Review> {
    const review = await this.getById(id);
    ReviewLifecyclePolicy.assertCanTransition(
      review,
      ReviewStatus.IN_REVIEW,
    );
    review.start(now);
    await this.deps.reviewRepository.update(review);
    await this.deps.eventPublisher.publish(review.pullDomainEvents());
    return review;
  }

  async archive(id: ReviewId, now?: Date): Promise<Review> {
    const review = await this.getById(id);
    ReviewLifecyclePolicy.assertCanTransition(
      review,
      ReviewStatus.ARCHIVED,
    );
    review.archive(now);
    await this.deps.reviewRepository.archive(id);
    await this.deps.reviewRepository.update(review);
    await this.deps.eventPublisher.publish(review.pullDomainEvents());
    return review;
  }

  async markApproved(id: ReviewId, now?: Date): Promise<Review> {
    const review = await this.getById(id);
    ReviewLifecyclePolicy.assertCanApprove(review);
    review.markApproved(now);
    await this.deps.reviewRepository.update(review);
    await this.deps.eventPublisher.publish(review.pullDomainEvents());
    return review;
  }

  async markRejected(id: ReviewId, now?: Date): Promise<Review> {
    const review = await this.getById(id);
    review.markRejected(now);
    await this.deps.reviewRepository.update(review);
    await this.deps.eventPublisher.publish(review.pullDomainEvents());
    return review;
  }

  async getById(id: ReviewId): Promise<Review> {
    const review = await this.deps.reviewRepository.findById(id);
    if (!review) throw new ReviewNotFoundError(id);
    return review;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Review[]> {
    return this.deps.reviewRepository.findByOrganization(organizationId);
  }

  async listByProject(projectId: ProjectId): Promise<Review[]> {
    return this.deps.reviewRepository.findByProject(projectId);
  }

  async listByProduction(productionId: ProductionId): Promise<Review[]> {
    return this.deps.reviewRepository.findByProduction(productionId);
  }

  async listByAsset(assetId: AssetId): Promise<Review[]> {
    return this.deps.reviewRepository.findByAsset(assetId);
  }
}
