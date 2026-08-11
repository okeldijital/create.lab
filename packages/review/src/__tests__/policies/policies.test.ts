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
  DuplicateDecisionError,
  SessionAlreadyActiveError,
} from "../../errors/ReviewErrors.js";
import {
  ApprovalPolicy,
  DecisionPolicy,
  ReviewLifecyclePolicy,
  SessionPolicy,
} from "../../policies/index.js";

const orgId = asOrganizationId("org-1");

function review() {
  return Review.create({
    organizationId: orgId,
    projectId: asProjectId("p1"),
    productionId: asProductionId("pr1"),
    assetId: asAssetId("a1"),
    title: "R",
  });
}

describe("ReviewLifecyclePolicy", () => {
  it("allows start from DRAFT", () => {
    const r = review();
    expect(() =>
      ReviewLifecyclePolicy.assertCanTransition(r, ReviewStatus.IN_REVIEW),
    ).not.toThrow();
  });

  it("blocks activity on archived", () => {
    const r = review();
    r.archive();
    expect(() => ReviewLifecyclePolicy.assertAcceptsActivity(r)).toThrow();
  });
});

describe("ApprovalPolicy", () => {
  it("blocks recording on completed", () => {
    const r = review();
    const a = Approval.create({
      organizationId: orgId,
      reviewId: r.id,
      requiredApprovals: 1,
    });
    a.recordApproval();
    expect(() => ApprovalPolicy.assertCanRecordApproval(a)).toThrow();
  });
});

describe("SessionPolicy", () => {
  it("rejects second active session", () => {
    const r = review();
    const s = ReviewSession.create({
      organizationId: orgId,
      reviewId: r.id,
    });
    expect(() => SessionPolicy.assertNoActiveSession([s], r.id)).toThrow(
      SessionAlreadyActiveError,
    );
  });
});

describe("DecisionPolicy", () => {
  it("one decision per reviewer", () => {
    const r = review();
    const a = Approval.create({
      organizationId: orgId,
      reviewId: r.id,
      requiredApprovals: 2,
    });
    const d = ReviewDecision.create({
      organizationId: orgId,
      approvalId: a.id,
      reviewerId: "rev-1",
      decision: DecisionType.APPROVE,
    });
    expect(() =>
      DecisionPolicy.assertOnePerReviewer([d], a.id, "rev-1"),
    ).toThrow(DuplicateDecisionError);
    expect(() =>
      DecisionPolicy.assertOnePerReviewer([d], a.id, "rev-2"),
    ).not.toThrow();
  });
});

describe("ReviewLifecyclePolicy approve path", () => {
  it("assertCanApprove on IN_REVIEW", () => {
    const r = review();
    r.start();
    expect(() => ReviewLifecyclePolicy.assertCanApprove(r)).not.toThrow();
  });

  it("assertMutable on DRAFT", () => {
    const r = review();
    expect(() => ReviewLifecyclePolicy.assertMutable(r)).not.toThrow();
  });
});
