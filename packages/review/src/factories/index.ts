import { Review, type CreateReviewProps } from "../aggregates/Review/Review.js";
import {
  Approval,
  type CreateApprovalProps,
} from "../aggregates/Approval/Approval.js";
import {
  ReviewSession,
  type CreateReviewSessionProps,
} from "../aggregates/ReviewSession/ReviewSession.js";
import {
  ReviewDecision,
  type CreateReviewDecisionProps,
} from "../aggregates/ReviewDecision/ReviewDecision.js";

export const ReviewFactory = {
  create: (props: CreateReviewProps) => Review.create(props),
  reconstitute: Review.reconstitute.bind(Review),
};

export const ApprovalFactory = {
  create: (props: CreateApprovalProps) => Approval.create(props),
  reconstitute: Approval.reconstitute.bind(Approval),
};

export const ReviewSessionFactory = {
  create: (props: CreateReviewSessionProps) => ReviewSession.create(props),
  reconstitute: ReviewSession.reconstitute.bind(ReviewSession),
};

export const ReviewDecisionFactory = {
  create: (props: CreateReviewDecisionProps) => ReviewDecision.create(props),
  reconstitute: ReviewDecision.reconstitute.bind(ReviewDecision),
};
