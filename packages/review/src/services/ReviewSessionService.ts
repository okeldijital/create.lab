import {
  ReviewSession,
  type CreateReviewSessionProps,
} from "../aggregates/ReviewSession/ReviewSession.js";
import {
  ReviewNotFoundError,
  SessionNotFoundError,
} from "../errors/ReviewErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ReviewLifecyclePolicy } from "../policies/ReviewLifecyclePolicy.js";
import { SessionPolicy } from "../policies/SessionPolicy.js";
import type { ReviewRepository } from "../repositories/ReviewRepository.js";
import type { ReviewSessionRepository } from "../repositories/ReviewSessionRepository.js";
import type { ReviewId, ReviewSessionId } from "../types/ids.js";

export type ReviewSessionServiceDeps = {
  reviewSessionRepository: ReviewSessionRepository;
  reviewRepository: ReviewRepository;
  eventPublisher: DomainEventPublisher;
};

export class ReviewSessionService {
  constructor(private readonly deps: ReviewSessionServiceDeps) {}

  async open(props: CreateReviewSessionProps): Promise<ReviewSession> {
    const review = await this.deps.reviewRepository.findById(props.reviewId);
    if (!review) throw new ReviewNotFoundError(props.reviewId);
    ReviewLifecyclePolicy.assertAcceptsActivity(review);

    const existing = await this.deps.reviewSessionRepository.findByReview(
      props.reviewId,
    );
    SessionPolicy.assertNoActiveSession(existing, props.reviewId);

    const session = ReviewSession.create(props);
    review.attachSession(session.id);
    await this.deps.reviewSessionRepository.save(session);
    await this.deps.reviewRepository.update(review);
    await this.deps.eventPublisher.publish([
      ...session.pullDomainEvents(),
      ...review.pullDomainEvents(),
    ]);
    return session;
  }

  async startProgress(
    id: ReviewSessionId,
    now?: Date,
  ): Promise<ReviewSession> {
    const session = await this.getById(id);
    session.startProgress(now);
    await this.deps.reviewSessionRepository.update(session);
    await this.deps.eventPublisher.publish(session.pullDomainEvents());
    return session;
  }

  async complete(
    id: ReviewSessionId,
    endedAt?: Date,
  ): Promise<ReviewSession> {
    const session = await this.getById(id);
    session.complete(endedAt);
    await this.deps.reviewSessionRepository.update(session);
    await this.deps.eventPublisher.publish(session.pullDomainEvents());
    return session;
  }

  async getById(id: ReviewSessionId): Promise<ReviewSession> {
    const session = await this.deps.reviewSessionRepository.findById(id);
    if (!session) throw new SessionNotFoundError(id);
    return session;
  }

  async listByReview(reviewId: ReviewId): Promise<ReviewSession[]> {
    return this.deps.reviewSessionRepository.findByReview(reviewId);
  }
}
