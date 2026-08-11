import { describe, expect, it, beforeEach } from "vitest";
import { asAssetId } from "@creative-lab/assets";
import { Organization, asOrganizationId } from "@creative-lab/organization";
import { asProductionId } from "@creative-lab/production";
import { asProjectId } from "@creative-lab/projects";
import { ApprovalStatus } from "../../enums/ApprovalStatus.js";
import { DecisionType } from "../../enums/DecisionType.js";
import { ReviewStatus } from "../../enums/ReviewStatus.js";
import { SessionStatus } from "../../enums/SessionStatus.js";
import {
  DuplicateDecisionError,
  SessionAlreadyActiveError,
} from "../../errors/ReviewErrors.js";
import {
  ApprovalCompleted,
  DecisionRecorded,
  ReviewApproved,
  ReviewArchived,
  ReviewCreated,
  ReviewRejected,
  ReviewSessionCompleted,
  ReviewSessionOpened,
  ReviewStarted,
} from "../../events/review-events.js";
import { ApprovalService } from "../../services/ApprovalService.js";
import { DecisionService } from "../../services/DecisionService.js";
import { ReviewService } from "../../services/ReviewService.js";
import { ReviewSessionService } from "../../services/ReviewSessionService.js";
import {
  InMemoryApprovalRepository,
  InMemoryEventPublisher,
  InMemoryOrganizationRepository,
  InMemoryReviewDecisionRepository,
  InMemoryReviewRepository,
  InMemoryReviewSessionRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const productionId = asProductionId("prod-1");
const assetId = asAssetId("asset-1");

describe("Review services", () => {
  let orgs: InMemoryOrganizationRepository;
  let reviews: InMemoryReviewRepository;
  let approvals: InMemoryApprovalRepository;
  let sessions: InMemoryReviewSessionRepository;
  let decisions: InMemoryReviewDecisionRepository;
  let events: InMemoryEventPublisher;
  let reviewService: ReviewService;
  let approvalService: ApprovalService;
  let sessionService: ReviewSessionService;
  let decisionService: DecisionService;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    reviews = new InMemoryReviewRepository();
    approvals = new InMemoryApprovalRepository();
    sessions = new InMemoryReviewSessionRepository();
    decisions = new InMemoryReviewDecisionRepository();
    events = new InMemoryEventPublisher();
    await orgs.save(
      Organization.create({ name: "Studio", slug: "studio", id: orgId }),
    );
    reviewService = new ReviewService({
      reviewRepository: reviews,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    approvalService = new ApprovalService({
      approvalRepository: approvals,
      reviewRepository: reviews,
      eventPublisher: events,
    });
    sessionService = new ReviewSessionService({
      reviewSessionRepository: sessions,
      reviewRepository: reviews,
      eventPublisher: events,
    });
    decisionService = new DecisionService({
      reviewDecisionRepository: decisions,
      approvalRepository: approvals,
      reviewRepository: reviews,
      eventPublisher: events,
    });
  });

  async function draftReview() {
    return reviewService.create({
      organizationId: orgId,
      projectId,
      productionId,
      assetId,
      title: "Mix Approval",
    });
  }

  it("creates and starts review", async () => {
    const r = await draftReview();
    expect(events.events.some((e) => e instanceof ReviewCreated)).toBe(true);
    await reviewService.start(r.id);
    expect(events.events.some((e) => e instanceof ReviewStarted)).toBe(true);
    expect((await reviewService.getById(r.id)).status).toBe(
      ReviewStatus.IN_REVIEW,
    );
  });

  it("archives review", async () => {
    const r = await draftReview();
    await reviewService.archive(r.id);
    expect(events.events.some((e) => e instanceof ReviewArchived)).toBe(true);
    expect((await reviewService.getById(r.id)).archived).toBe(true);
  });

  it("approval lifecycle auto-approves review", async () => {
    const r = await draftReview();
    await reviewService.start(r.id);
    const approval = await approvalService.create({
      organizationId: orgId,
      reviewId: r.id,
      requiredApprovals: 2,
    });
    await approvalService.recordApproval(approval.id);
    expect(
      (await approvalService.getById(approval.id)).status,
    ).toBe(ApprovalStatus.PARTIALLY_APPROVED);

    const { reviewAutoApproved } = await approvalService.recordApproval(
      approval.id,
    );
    expect(reviewAutoApproved).toBe(true);
    expect(events.events.some((e) => e instanceof ApprovalCompleted)).toBe(
      true,
    );
    expect(events.events.some((e) => e instanceof ReviewApproved)).toBe(true);
    expect((await reviewService.getById(r.id)).status).toBe(
      ReviewStatus.APPROVED,
    );
  });

  it("reject approval rejects review", async () => {
    const r = await draftReview();
    await reviewService.start(r.id);
    const approval = await approvalService.create({
      organizationId: orgId,
      reviewId: r.id,
      requiredApprovals: 1,
    });
    await approvalService.reject(approval.id);
    expect(events.events.some((e) => e instanceof ReviewRejected)).toBe(true);
    expect((await reviewService.getById(r.id)).status).toBe(
      ReviewStatus.REJECTED,
    );
  });

  it("session open complete and single active", async () => {
    const r = await draftReview();
    await reviewService.start(r.id);
    const s = await sessionService.open({
      organizationId: orgId,
      reviewId: r.id,
    });
    expect(events.events.some((e) => e instanceof ReviewSessionOpened)).toBe(
      true,
    );
    await expect(
      sessionService.open({ organizationId: orgId, reviewId: r.id }),
    ).rejects.toThrow(SessionAlreadyActiveError);

    await sessionService.startProgress(s.id);
    expect((await sessionService.getById(s.id)).status).toBe(
      SessionStatus.IN_PROGRESS,
    );
    await sessionService.complete(s.id);
    expect(events.events.some((e) => e instanceof ReviewSessionCompleted)).toBe(
      true,
    );

    const s2 = await sessionService.open({
      organizationId: orgId,
      reviewId: r.id,
    });
    expect(s2.isActive).toBe(true);
  });

  it("records decisions with one-per-reviewer", async () => {
    const r = await draftReview();
    await reviewService.start(r.id);
    const approval = await approvalService.create({
      organizationId: orgId,
      reviewId: r.id,
      requiredApprovals: 2,
    });

    await decisionService.record({
      organizationId: orgId,
      approvalId: approval.id,
      reviewerId: "alice",
      decision: DecisionType.APPROVE,
    });
    expect(events.events.some((e) => e instanceof DecisionRecorded)).toBe(true);

    await expect(
      decisionService.record({
        organizationId: orgId,
        approvalId: approval.id,
        reviewerId: "alice",
        decision: DecisionType.APPROVE,
      }),
    ).rejects.toThrow(DuplicateDecisionError);

    await decisionService.record({
      organizationId: orgId,
      approvalId: approval.id,
      reviewerId: "bob",
      decision: DecisionType.APPROVE,
    });
    expect((await reviewService.getById(r.id)).status).toBe(
      ReviewStatus.APPROVED,
    );
  });

  it("lists reviews by project production asset", async () => {
    await draftReview();
    expect((await reviewService.listByProject(projectId)).length).toBe(1);
    expect((await reviewService.listByProduction(productionId)).length).toBe(1);
    expect((await reviewService.listByAsset(assetId)).length).toBe(1);
  });

  it("REQUEST_CHANGES records decision without completing approval", async () => {
    const r = await draftReview();
    await reviewService.start(r.id);
    const approval = await approvalService.create({
      organizationId: orgId,
      reviewId: r.id,
      requiredApprovals: 1,
    });
    await decisionService.record({
      organizationId: orgId,
      approvalId: approval.id,
      reviewerId: "carol",
      decision: DecisionType.REQUEST_CHANGES,
      notes: "Need louder vocals",
    });
    const ap = await approvalService.getById(approval.id);
    expect(ap.status).toBe(ApprovalStatus.PENDING);
    expect(ap.completedApprovals).toBe(0);
    expect((await decisionService.listByApproval(approval.id)).length).toBe(1);
  });

  it("REJECT decision rejects approval and review", async () => {
    const r = await draftReview();
    await reviewService.start(r.id);
    const approval = await approvalService.create({
      organizationId: orgId,
      reviewId: r.id,
      requiredApprovals: 2,
    });
    await decisionService.record({
      organizationId: orgId,
      approvalId: approval.id,
      reviewerId: "dave",
      decision: DecisionType.REJECT,
    });
    expect((await approvalService.getById(approval.id)).status).toBe(
      ApprovalStatus.REJECTED,
    );
    expect((await reviewService.getById(r.id)).status).toBe(
      ReviewStatus.REJECTED,
    );
  });

  it("lists sessions and approvals by review", async () => {
    const r = await draftReview();
    await reviewService.start(r.id);
    await approvalService.create({
      organizationId: orgId,
      reviewId: r.id,
      requiredApprovals: 1,
    });
    await sessionService.open({
      organizationId: orgId,
      reviewId: r.id,
    });
    expect((await approvalService.listByReview(r.id)).length).toBe(1);
    expect((await sessionService.listByReview(r.id)).length).toBe(1);
  });
});
