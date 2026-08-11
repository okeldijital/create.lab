import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { asOrganizationId } from "@creative-lab/organization";
import { KnowledgeStatus } from "../../enums/KnowledgeStatus.js";
import { RelationshipType } from "../../enums/RelationshipType.js";
import { VersionStatus } from "../../enums/VersionStatus.js";
import {
  KnowledgeActivated,
  KnowledgeApproved,
  KnowledgeArchived,
  KnowledgeArticleCreated,
  KnowledgeCategoryArchived,
  KnowledgeCategoryCreated,
  KnowledgeReferenceCreated,
  KnowledgeReferenceRemoved,
  KnowledgeRetired,
  KnowledgeSubmittedForReview,
  KnowledgeVersionCreated,
  KnowledgeVersionPromoted,
} from "../../events/knowledge-events.js";
import {
  asKnowledgeArticleId,
  asKnowledgeCategoryId,
  asKnowledgeReferenceId,
  asKnowledgeVersionId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const articleId = asKnowledgeArticleId("a1");
const versionId = asKnowledgeVersionId("v1");
const categoryId = asKnowledgeCategoryId("c1");
const referenceId = asKnowledgeReferenceId("r1");

describe("Domain events", () => {
  it("KnowledgeArticleCreated frozen versioned", () => {
    const e = KnowledgeArticleCreated.create({
      organizationId: orgId,
      articleId,
      articleNumber: "KNW-1",
      title: "SOP",
      status: KnowledgeStatus.DRAFT,
    });
    expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(Object.isFrozen(e)).toBe(true);
    expect(Object.isFrozen(e.payload)).toBe(true);
    expect(e.payload.articleNumber).toBe("KNW-1");
    expect(e.eventType).toBe("KnowledgeArticleCreated");
  });

  it("article lifecycle events", () => {
    const events = [
      KnowledgeSubmittedForReview.create({ organizationId: orgId, articleId }),
      KnowledgeApproved.create({ organizationId: orgId, articleId }),
      KnowledgeActivated.create({ organizationId: orgId, articleId }),
      KnowledgeRetired.create({ organizationId: orgId, articleId }),
      KnowledgeArchived.create({ organizationId: orgId, articleId }),
    ];
    for (const e of events) {
      expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
      expect(Object.isFrozen(e)).toBe(true);
      expect(Object.isFrozen(e.payload)).toBe(true);
      expect(e.payload.articleId).toBe(articleId);
    }
  });

  it("version events", () => {
    const created = KnowledgeVersionCreated.create({
      organizationId: orgId,
      versionId,
      articleId,
      versionNumber: 1,
      status: VersionStatus.DRAFT,
    });
    expect(created.payload.versionNumber).toBe(1);
    expect(Object.isFrozen(created)).toBe(true);

    const promoted = KnowledgeVersionPromoted.create({
      organizationId: orgId,
      versionId,
      articleId,
      previousVersionId: null,
    });
    expect(promoted.payload.previousVersionId).toBeNull();
    expect(promoted.eventVersion).toBe(DOMAIN_EVENT_VERSION);
  });

  it("category events", () => {
    const created = KnowledgeCategoryCreated.create({
      organizationId: orgId,
      categoryId,
      name: "SOPs",
    });
    expect(created.payload.name).toBe("SOPs");
    expect(Object.isFrozen(created.payload)).toBe(true);

    const archived = KnowledgeCategoryArchived.create({
      organizationId: orgId,
      categoryId,
    });
    expect(archived.payload.categoryId).toBe(categoryId);
  });

  it("reference events", () => {
    const created = KnowledgeReferenceCreated.create({
      organizationId: orgId,
      referenceId,
      sourceArticleId: articleId,
      targetArticleId: asKnowledgeArticleId("a2"),
      relationshipType: RelationshipType.REFERENCES,
    });
    expect(created.payload.relationshipType).toBe(RelationshipType.REFERENCES);
    expect(Object.isFrozen(created)).toBe(true);

    const removed = KnowledgeReferenceRemoved.create({
      organizationId: orgId,
      referenceId,
    });
    expect(removed.payload.referenceId).toBe(referenceId);
  });

  it("aggregateId set correctly", () => {
    const e = KnowledgeActivated.create({ organizationId: orgId, articleId });
    expect(e.aggregateId).toBe(articleId);
    expect(e.organizationId).toBe(orgId);
  });
});
