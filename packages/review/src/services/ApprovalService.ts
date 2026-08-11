import {
  Approval,
  type CreateApprovalProps,
} from "../aggregates/Approval/Approval.js";
import { ApprovalStatus } from "../enums/ApprovalStatus.js";
import {
  ApprovalNotFoundError,
  ReviewNotFoundError,
} from "../errors/ReviewErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ApprovalPolicy } from "../policies/ApprovalPolicy.js";
import { ReviewLifecyclePolicy } from "../policies/ReviewLifecyclePolicy.js";
import type { ApprovalRepository } from "../repositories/ApprovalRepository.js";
import type { ReviewRepository } from "../repositories/ReviewRepository.js";
import type { ApprovalId, ReviewId } from "../types/ids.js";

export type ApprovalServiceDeps = {
  approvalRepository: ApprovalRepository;
  reviewRepository: ReviewRepository;
  eventPublisher: DomainEventPublisher;
};

export class ApprovalService {
  constructor(private readonly deps: ApprovalServiceDeps) {}

  async create(props: CreateApprovalProps): Promise<Approval> {
    const review = await this.deps.reviewRepository.findById(props.reviewId);
    if (!review) throw new ReviewNotFoundError(props.reviewId);
    ReviewLifecyclePolicy.assertAcceptsActivity(review);

    const approval = Approval.create(props);
    review.attachApproval(approval.id);
    await this.deps.approvalRepository.save(approval);
    await this.deps.reviewRepository.update(review);
    await this.deps.eventPublisher.publish([
      ...approval.pullDomainEvents(),
      ...review.pullDomainEvents(),
    ]);
    return approval;
  }

  async recordApproval(
    id: ApprovalId,
    now?: Date,
  ): Promise<{ approval: Approval; reviewAutoApproved: boolean }> {
    const approval = await this.getById(id);
    ApprovalPolicy.assertCanRecordApproval(approval);
    approval.recordApproval(now);
    await this.deps.approvalRepository.update(approval);

    let reviewAutoApproved = false;
    if (approval.status === ApprovalStatus.APPROVED) {
      const review = await this.deps.reviewRepository.findById(
        approval.reviewId,
      );
      if (review && !review.isApproved && !review.archived) {
        review.markApproved(now);
        await this.deps.reviewRepository.update(review);
        await this.deps.eventPublisher.publish([
          ...approval.pullDomainEvents(),
          ...review.pullDomainEvents(),
        ]);
        reviewAutoApproved = true;
        return { approval, reviewAutoApproved };
      }
    }

    await this.deps.eventPublisher.publish(approval.pullDomainEvents());
    return { approval, reviewAutoApproved };
  }

  async reject(id: ApprovalId, now?: Date): Promise<Approval> {
    const approval = await this.getById(id);
    ApprovalPolicy.assertNotCompleted(approval);
    approval.reject(now);
    await this.deps.approvalRepository.update(approval);

    const review = await this.deps.reviewRepository.findById(
      approval.reviewId,
    );
    if (review && !review.archived) {
      review.markRejected(now);
      await this.deps.reviewRepository.update(review);
      await this.deps.eventPublisher.publish([
        ...approval.pullDomainEvents(),
        ...review.pullDomainEvents(),
      ]);
    } else {
      await this.deps.eventPublisher.publish(approval.pullDomainEvents());
    }
    return approval;
  }

  async getById(id: ApprovalId): Promise<Approval> {
    const approval = await this.deps.approvalRepository.findById(id);
    if (!approval) throw new ApprovalNotFoundError(id);
    return approval;
  }

  async listByReview(reviewId: ReviewId): Promise<Approval[]> {
    return this.deps.approvalRepository.findByReview(reviewId);
  }
}
