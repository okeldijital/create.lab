import { describe, expect, it } from "vitest";
import { asAssetId } from "@creative-lab/assets";
import { asOrganizationId } from "@creative-lab/organization";
import { asProductionId } from "@creative-lab/production";
import { asProjectId } from "@creative-lab/projects";
import { Approval } from "../../aggregates/Approval/Approval.js";
import { Review } from "../../aggregates/Review/Review.js";
import { ReviewDecision } from "../../aggregates/ReviewDecision/ReviewDecision.js";
import { ReviewSession } from "../../aggregates/ReviewSession/ReviewSession.js";
import { DecisionType } from "../../enums/DecisionType.js";
import { ReviewStatus } from "../../enums/ReviewStatus.js";
import {
  InMemoryApprovalRepository,
  InMemoryReviewDecisionRepository,
  InMemoryReviewRepository,
  InMemoryReviewSessionRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const productionId = asProductionId("prod-1");
const assetId = asAssetId("asset-1");

describe("Repository contracts", () => {
  it("ReviewRepository ports", async () => {
    const repo = new InMemoryReviewRepository();
    const r = Review.create({
      organizationId: orgId,
      projectId,
      productionId,
      assetId,
      title: "T",
    });
    await repo.save(r);
    expect(await repo.exists(r.id)).toBe(true);
    expect((await repo.findByProject(projectId))[0]?.id).toBe(r.id);
    expect((await repo.findByProduction(productionId))[0]?.id).toBe(r.id);
    expect((await repo.findByAsset(assetId))[0]?.id).toBe(r.id);
    expect((await repo.findByStatus(ReviewStatus.DRAFT)).length).toBe(1);
  });

  it("Approval Session Decision ports", async () => {
    const review = Review.create({
      organizationId: orgId,
      projectId,
      productionId,
      assetId,
      title: "T",
    });
    const aRepo = new InMemoryApprovalRepository();
    const a = Approval.create({
      organizationId: orgId,
      reviewId: review.id,
      requiredApprovals: 1,
    });
    await aRepo.save(a);
    expect((await aRepo.findByReview(review.id)).length).toBe(1);

    const sRepo = new InMemoryReviewSessionRepository();
    const s = ReviewSession.create({
      organizationId: orgId,
      reviewId: review.id,
    });
    await sRepo.save(s);
    expect((await sRepo.findActive(review.id))?.id).toBe(s.id);

    const dRepo = new InMemoryReviewDecisionRepository();
    await dRepo.save(
      ReviewDecision.create({
        organizationId: orgId,
        approvalId: a.id,
        reviewerId: "r1",
        decision: DecisionType.APPROVE,
      }),
    );
    expect((await dRepo.findByApproval(a.id)).length).toBe(1);
  });
});
