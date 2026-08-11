import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { asOrganizationId } from "@creative-lab/organization";
import { ApprovalStatus } from "../../enums/ApprovalStatus.js";
import { DecisionType } from "../../enums/DecisionType.js";
import { ReviewStatus } from "../../enums/ReviewStatus.js";
import { SessionStatus } from "../../enums/SessionStatus.js";
import {
  ApprovalCompleted,
  ApprovalCreated,
  ApprovalRejected,
  DecisionRecorded,
  ReviewApproved,
  ReviewArchived,
  ReviewCreated,
  ReviewRejected,
  ReviewSessionCompleted,
  ReviewSessionOpened,
  ReviewStarted,
} from "../../events/review-events.js";
import {
  asApprovalId,
  asReviewDecisionId,
  asReviewId,
  asReviewSessionId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const reviewId = asReviewId("rev-1");

describe("Domain events", () => {
  it("are frozen and versioned", () => {
    const e = ReviewCreated.create({
      organizationId: orgId,
      reviewId,
      projectId: "p",
      productionId: "pr",
      assetId: "a",
      title: "T",
      status: ReviewStatus.DRAFT,
    });
    expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(Object.isFrozen(e)).toBe(true);
    expect(Object.isFrozen(e.payload)).toBe(true);
  });

  it("covers minimum event set", () => {
    const events = [
      ReviewStarted.create({ organizationId: orgId, reviewId }),
      ReviewApproved.create({ organizationId: orgId, reviewId }),
      ReviewRejected.create({ organizationId: orgId, reviewId }),
      ReviewArchived.create({ organizationId: orgId, reviewId }),
      ApprovalCreated.create({
        organizationId: orgId,
        approvalId: asApprovalId("ap1"),
        reviewId,
        requiredApprovals: 2,
        status: ApprovalStatus.PENDING,
      }),
      ApprovalCompleted.create({
        organizationId: orgId,
        approvalId: asApprovalId("ap1"),
        reviewId,
      }),
      ApprovalRejected.create({
        organizationId: orgId,
        approvalId: asApprovalId("ap1"),
        reviewId,
      }),
      ReviewSessionOpened.create({
        organizationId: orgId,
        sessionId: asReviewSessionId("s1"),
        reviewId,
        status: SessionStatus.OPEN,
      }),
      ReviewSessionCompleted.create({
        organizationId: orgId,
        sessionId: asReviewSessionId("s1"),
        reviewId,
      }),
      DecisionRecorded.create({
        organizationId: orgId,
        decisionId: asReviewDecisionId("d1"),
        approvalId: asApprovalId("ap1"),
        reviewerId: "r1",
        decision: DecisionType.APPROVE,
      }),
    ];
    for (const e of events) {
      expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
      expect(Object.isFrozen(e)).toBe(true);
    }
  });
});
