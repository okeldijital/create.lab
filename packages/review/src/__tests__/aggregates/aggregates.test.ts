import { describe, expect, it } from "vitest";
import { asAssetId } from "@creative-lab/assets";
import { asOrganizationId } from "@creative-lab/organization";
import { asProductionId } from "@creative-lab/production";
import { asProjectId } from "@creative-lab/projects";
import { Approval } from "../../aggregates/Approval/Approval.js";
import { Review } from "../../aggregates/Review/Review.js";
import { ReviewDecision } from "../../aggregates/ReviewDecision/ReviewDecision.js";
import { ReviewSession } from "../../aggregates/ReviewSession/ReviewSession.js";
import { ApprovalStatus } from "../../enums/ApprovalStatus.js";
import { DecisionType } from "../../enums/DecisionType.js";
import { ReviewStatus } from "../../enums/ReviewStatus.js";
import { SessionStatus } from "../../enums/SessionStatus.js";
import {
  ApprovalAlreadyCompletedError,
  InvalidReviewStateError,
  ReviewAlreadyApprovedError,
} from "../../errors/ReviewErrors.js";
import {
  ApprovalCompleted,
  DecisionRecorded,
  ReviewApproved,
  ReviewArchived,
  ReviewCreated,
  ReviewSessionOpened,
  ReviewStarted,
} from "../../events/review-events.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const productionId = asProductionId("prod-1");
const assetId = asAssetId("asset-1");

function createReview(
  overrides: Partial<Parameters<typeof Review.create>[0]> = {},
) {
  return Review.create({
    organizationId: orgId,
    projectId,
    productionId,
    assetId,
    title: "Master Review",
    ...overrides,
  });
}

describe("Review aggregate", () => {
  it("creates DRAFT with event", () => {
    const r = createReview();
    expect(r.status).toBe(ReviewStatus.DRAFT);
    expect(r.assetId).toBe(assetId);
    expect(r.pullDomainEvents()[0]).toBeInstanceOf(ReviewCreated);
  });

  it("starts, approves, archives", () => {
    const r = createReview();
    r.pullDomainEvents();
    r.start();
    expect(r.status).toBe(ReviewStatus.IN_REVIEW);
    expect(r.pullDomainEvents()[0]).toBeInstanceOf(ReviewStarted);
    r.markApproved();
    expect(r.status).toBe(ReviewStatus.APPROVED);
    expect(r.pullDomainEvents()[0]).toBeInstanceOf(ReviewApproved);
    r.archive();
    expect(r.archived).toBe(true);
    expect(r.pullDomainEvents()[0]).toBeInstanceOf(ReviewArchived);
  });

  it("rejects double approve", () => {
    const r = createReview();
    r.start();
    r.markApproved();
    expect(() => r.markApproved()).toThrow(ReviewAlreadyApprovedError);
  });

  it("archive is immutable", () => {
    const r = createReview();
    r.archive();
    expect(() => r.start()).toThrow(InvalidReviewStateError);
  });

  it("immutable asset/project/production refs", () => {
    const r = createReview();
    expect(r.projectId).toBe(projectId);
    expect(r.productionId).toBe(productionId);
    expect(r.assetId).toBe(assetId);
  });

  it("reconstitutes snapshot", () => {
    const r = createReview();
    const restored = Review.reconstitute(r.toSnapshot());
    expect(restored.id).toBe(r.id);
    expect(restored.title.value).toBe("Master Review");
  });
});

describe("Approval aggregate", () => {
  it("auto-completes when requirement met", () => {
    const review = createReview();
    const a = Approval.create({
      organizationId: orgId,
      reviewId: review.id,
      requiredApprovals: 2,
    });
    a.recordApproval();
    expect(a.status).toBe(ApprovalStatus.PARTIALLY_APPROVED);
    expect(a.completedApprovals).toBe(1);
    a.pullDomainEvents();
    a.recordApproval();
    expect(a.status).toBe(ApprovalStatus.APPROVED);
    expect(a.completedApprovals).toBe(2);
    expect(a.pullDomainEvents()[0]).toBeInstanceOf(ApprovalCompleted);
  });

  it("cannot exceed required", () => {
    const review = createReview();
    const a = Approval.create({
      organizationId: orgId,
      reviewId: review.id,
      requiredApprovals: 1,
    });
    a.recordApproval();
    expect(() => a.recordApproval()).toThrow(ApprovalAlreadyCompletedError);
  });

  it("reject completes workflow", () => {
    const review = createReview();
    const a = Approval.create({
      organizationId: orgId,
      reviewId: review.id,
      requiredApprovals: 2,
    });
    a.reject();
    expect(a.status).toBe(ApprovalStatus.REJECTED);
    expect(() => a.recordApproval()).toThrow(ApprovalAlreadyCompletedError);
  });
});

describe("ReviewSession aggregate", () => {
  it("opens and completes", () => {
    const review = createReview();
    const s = ReviewSession.create({
      organizationId: orgId,
      reviewId: review.id,
    });
    expect(s.status).toBe(SessionStatus.OPEN);
    expect(s.pullDomainEvents()[0]).toBeInstanceOf(ReviewSessionOpened);
    s.startProgress();
    expect(s.status).toBe(SessionStatus.IN_PROGRESS);
    s.complete();
    expect(s.status).toBe(SessionStatus.COMPLETED);
  });

  it("completed immutable", () => {
    const review = createReview();
    const s = ReviewSession.create({
      organizationId: orgId,
      reviewId: review.id,
    });
    s.complete();
    expect(() => s.startProgress()).toThrow(InvalidReviewStateError);
  });
});

describe("ReviewDecision aggregate", () => {
  it("is immutable after create", () => {
    const review = createReview();
    const approval = Approval.create({
      organizationId: orgId,
      reviewId: review.id,
      requiredApprovals: 1,
    });
    const d = ReviewDecision.create({
      organizationId: orgId,
      approvalId: approval.id,
      reviewerId: "reviewer-1",
      decision: DecisionType.APPROVE,
      notes: "Looks good",
    });
    expect(d.isApprove).toBe(true);
    expect(d.pullDomainEvents()[0]).toBeInstanceOf(DecisionRecorded);
    expect(d.toSnapshot().notes).toBe("Looks good");
  });

  it("supports reject and request changes types", () => {
    const review = createReview();
    const approval = Approval.create({
      organizationId: orgId,
      reviewId: review.id,
      requiredApprovals: 1,
    });
    const reject = ReviewDecision.create({
      organizationId: orgId,
      approvalId: approval.id,
      reviewerId: "r2",
      decision: DecisionType.REJECT,
    });
    expect(reject.isReject).toBe(true);
    const changes = ReviewDecision.create({
      organizationId: orgId,
      approvalId: approval.id,
      reviewerId: "r3",
      decision: DecisionType.REQUEST_CHANGES,
    });
    expect(changes.decision).toBe(DecisionType.REQUEST_CHANGES);
  });
});

describe("Review attach children", () => {
  it("attaches approval and session ids", () => {
    const r = createReview();
    const a = Approval.create({
      organizationId: orgId,
      reviewId: r.id,
      requiredApprovals: 1,
    });
    const s = ReviewSession.create({
      organizationId: orgId,
      reviewId: r.id,
    });
    r.attachApproval(a.id);
    r.attachSession(s.id);
    expect(r.approvalIds).toContain(a.id);
    expect(r.reviewSessionIds).toContain(s.id);
  });
});
