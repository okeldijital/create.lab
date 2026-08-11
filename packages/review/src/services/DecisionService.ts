import {
  ReviewDecision,
  type CreateReviewDecisionProps,
} from "../aggregates/ReviewDecision/ReviewDecision.js";
import { DecisionType } from "../enums/DecisionType.js";
import {
  ApprovalNotFoundError,
  DecisionNotFoundError,
} from "../errors/ReviewErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ApprovalPolicy } from "../policies/ApprovalPolicy.js";
import { DecisionPolicy } from "../policies/DecisionPolicy.js";
import type { ApprovalRepository } from "../repositories/ApprovalRepository.js";
import type { ReviewDecisionRepository } from "../repositories/ReviewDecisionRepository.js";
import type { ReviewRepository } from "../repositories/ReviewRepository.js";
import type { ApprovalId, ReviewDecisionId } from "../types/ids.js";
import { ApprovalService } from "./ApprovalService.js";

export type DecisionServiceDeps = {
  reviewDecisionRepository: ReviewDecisionRepository;
  approvalRepository: ApprovalRepository;
  reviewRepository: ReviewRepository;
  eventPublisher: DomainEventPublisher;
};

export class DecisionService {
  private readonly approvalService: ApprovalService;

  constructor(private readonly deps: DecisionServiceDeps) {
    this.approvalService = new ApprovalService({
      approvalRepository: deps.approvalRepository,
      reviewRepository: deps.reviewRepository,
      eventPublisher: deps.eventPublisher,
    });
  }

  async record(props: CreateReviewDecisionProps): Promise<ReviewDecision> {
    const approval = await this.deps.approvalRepository.findById(
      props.approvalId,
    );
    if (!approval) throw new ApprovalNotFoundError(props.approvalId);
    ApprovalPolicy.assertNotCompleted(approval);

    const existing = await this.deps.reviewDecisionRepository.findByApproval(
      props.approvalId,
    );
    DecisionPolicy.assertOnePerReviewer(
      existing,
      props.approvalId,
      props.reviewerId,
    );

    const decision = ReviewDecision.create(props);
    await this.deps.reviewDecisionRepository.save(decision);
    await this.deps.eventPublisher.publish(decision.pullDomainEvents());

    // Apply decision to approval workflow
    if (props.decision === DecisionType.APPROVE) {
      await this.approvalService.recordApproval(props.approvalId);
    } else if (props.decision === DecisionType.REJECT) {
      await this.approvalService.reject(props.approvalId);
    }
    // REQUEST_CHANGES: decision recorded only; does not complete approval

    return decision;
  }

  async getById(id: ReviewDecisionId): Promise<ReviewDecision> {
    const decision = await this.deps.reviewDecisionRepository.findById(id);
    if (!decision) throw new DecisionNotFoundError(id);
    return decision;
  }

  async listByApproval(approvalId: ApprovalId): Promise<ReviewDecision[]> {
    return this.deps.reviewDecisionRepository.findByApproval(approvalId);
  }
}
