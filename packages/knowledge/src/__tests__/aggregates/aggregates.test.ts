import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { KnowledgeArticle } from "../../aggregates/KnowledgeArticle/KnowledgeArticle.js";
import { KnowledgeCategory } from "../../aggregates/KnowledgeCategory/KnowledgeCategory.js";
import { KnowledgeReference } from "../../aggregates/KnowledgeReference/KnowledgeReference.js";
import { KnowledgeVersion } from "../../aggregates/KnowledgeVersion/KnowledgeVersion.js";
import { CategoryStatus } from "../../enums/CategoryStatus.js";
import { KnowledgeStatus } from "../../enums/KnowledgeStatus.js";
import { RelationshipType } from "../../enums/RelationshipType.js";
import { VersionStatus } from "../../enums/VersionStatus.js";
import {
  InvalidKnowledgeStateError,
  KnowledgeAlreadyActiveError,
  KnowledgeValidationError,
} from "../../errors/KnowledgeErrors.js";
import {
  KnowledgeActivated,
  KnowledgeArchived,
  KnowledgeArticleCreated,
  KnowledgeApproved,
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
  asKnowledgeVersionId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const catId = asKnowledgeCategoryId("cat-1");
const articleId = asKnowledgeArticleId("art-1");

function createArticle(
  overrides: Partial<Parameters<typeof KnowledgeArticle.create>[0]> = {},
) {
  return KnowledgeArticle.create({
    organizationId: orgId,
    title: "Onboarding SOP",
    categoryId: catId,
    articleNumber: "KNW-001",
    ...overrides,
  });
}

function createVersion(
  overrides: Partial<Parameters<typeof KnowledgeVersion.create>[0]> = {},
) {
  return KnowledgeVersion.create({
    organizationId: orgId,
    articleId,
    versionNumber: 1,
    summary: "Initial revision",
    ...overrides,
  });
}

describe("KnowledgeArticle aggregate", () => {
  it("creates DRAFT with event and generated number", () => {
    const a = KnowledgeArticle.create({
      organizationId: orgId,
      title: "Guide",
      categoryId: catId,
    });
    expect(a.status).toBe(KnowledgeStatus.DRAFT);
    expect(a.articleNumber.value.startsWith("KNW-")).toBe(true);
    expect(a.pullDomainEvents()[0]).toBeInstanceOf(KnowledgeArticleCreated);
  });

  it("uses provided article number", () => {
    const a = createArticle({ articleNumber: "FIXED-1" });
    expect(a.articleNumber.value).toBe("FIXED-1");
  });

  it("articleNumber is immutable", () => {
    const a = createArticle();
    expect(a.articleNumber.value).toBe("KNW-001");
    // no setter exists; snapshot retains original
    expect(a.toSnapshot().articleNumber).toBe("KNW-001");
  });

  it("full lifecycle DRAFT→REVIEW→APPROVED→ACTIVE→RETIRED→ARCHIVED", () => {
    const a = createArticle();
    a.pullDomainEvents();
    const vId = asKnowledgeVersionId("v1");
    a.setCurrentVersion(vId);
    a.submitForReview();
    expect(a.pullDomainEvents()[0]).toBeInstanceOf(KnowledgeSubmittedForReview);
    expect(a.status).toBe(KnowledgeStatus.REVIEW);
    a.approve();
    expect(a.pullDomainEvents()[0]).toBeInstanceOf(KnowledgeApproved);
    a.activate();
    expect(a.isActive).toBe(true);
    expect(a.pullDomainEvents()[0]).toBeInstanceOf(KnowledgeActivated);
    a.retire();
    expect(a.isRetired).toBe(true);
    expect(a.pullDomainEvents()[0]).toBeInstanceOf(KnowledgeRetired);
    a.archive();
    expect(a.isArchived).toBe(true);
    expect(a.archivedAt).not.toBeNull();
    expect(a.pullDomainEvents()[0]).toBeInstanceOf(KnowledgeArchived);
  });

  it("requires current version to activate", () => {
    const a = createArticle({ articleNumber: "ACT" });
    a.submitForReview();
    a.approve();
    expect(() => a.activate()).toThrow(InvalidKnowledgeStateError);
  });

  it("rejects double activate", () => {
    const a = createArticle({ articleNumber: "DBL" });
    a.setCurrentVersion(asKnowledgeVersionId("v1"));
    a.submitForReview();
    a.approve();
    a.activate();
    expect(() => a.activate()).toThrow(KnowledgeAlreadyActiveError);
  });

  it("category immutable after ACTIVE", () => {
    const a = createArticle({ articleNumber: "CAT" });
    a.setCurrentVersion(asKnowledgeVersionId("v1"));
    a.submitForReview();
    a.approve();
    a.activate();
    expect(() => a.setCategory(asKnowledgeCategoryId("other"))).toThrow(
      InvalidKnowledgeStateError,
    );
  });

  it("allows category change before ACTIVE", () => {
    const a = createArticle({ articleNumber: "CAT2" });
    a.setCategory(asKnowledgeCategoryId("other"));
    expect(a.categoryId).toBe("other");
  });

  it("retired only allows archive", () => {
    const a = createArticle({ articleNumber: "RET" });
    a.setCurrentVersion(asKnowledgeVersionId("v1"));
    a.submitForReview();
    a.approve();
    a.activate();
    a.retire();
    expect(() => a.setCurrentVersion(asKnowledgeVersionId("v2"))).toThrow(
      InvalidKnowledgeStateError,
    );
    a.archive();
    expect(a.isArchived).toBe(true);
  });

  it("archived is immutable", () => {
    const a = createArticle({ articleNumber: "ARC" });
    a.archive();
    expect(() => a.submitForReview()).toThrow(InvalidKnowledgeStateError);
  });

  it("rejects illegal transitions", () => {
    const a = createArticle({ articleNumber: "ILL" });
    expect(() => a.approve()).toThrow(InvalidKnowledgeStateError);
    expect(() => a.retire()).toThrow(InvalidKnowledgeStateError);
  });

  it("tracks reference ids", () => {
    const a = createArticle({ articleNumber: "REF" });
    a.addReferenceId("r1" as never);
    a.addReferenceId("r1" as never);
    expect(a.referenceIds).toEqual(["r1"]);
    a.removeReferenceId("r1" as never);
    expect(a.referenceIds).toEqual([]);
  });

  it("reconstitutes from snapshot", () => {
    const a = createArticle({ articleNumber: "SNAP", description: "d" });
    const copy = KnowledgeArticle.reconstitute(a.toSnapshot());
    expect(copy.articleNumber.value).toBe("SNAP");
    expect(copy.description.value).toBe("d");
  });

  it("requires organization and category", () => {
    expect(() =>
      KnowledgeArticle.create({
        organizationId: "" as never,
        title: "T",
        categoryId: catId,
      }),
    ).toThrow(InvalidKnowledgeStateError);
    expect(() =>
      KnowledgeArticle.create({
        organizationId: orgId,
        title: "T",
        categoryId: "" as never,
      }),
    ).toThrow(InvalidKnowledgeStateError);
  });

  it("can archive from DRAFT", () => {
    const a = createArticle({ articleNumber: "DARC" });
    a.archive();
    expect(a.isArchived).toBe(true);
  });

  it("rejects double archive", () => {
    const a = createArticle({ articleNumber: "DARC2" });
    a.archive();
    expect(() => a.archive()).toThrow(InvalidKnowledgeStateError);
  });
});

describe("KnowledgeVersion aggregate", () => {
  it("creates DRAFT with event", () => {
    const v = createVersion();
    expect(v.status).toBe(VersionStatus.DRAFT);
    expect(v.versionNumber).toBe(1);
    expect(v.pullDomainEvents()[0]).toBeInstanceOf(KnowledgeVersionCreated);
  });

  it("lifecycle DRAFT→APPROVED→CURRENT→SUPERSEDED", () => {
    const v = createVersion();
    v.pullDomainEvents();
    v.approve();
    expect(v.status).toBe(VersionStatus.APPROVED);
    v.promote(null);
    expect(v.isCurrent).toBe(true);
    expect(v.pullDomainEvents()[0]).toBeInstanceOf(KnowledgeVersionPromoted);
    v.supersede();
    expect(v.isSuperseded).toBe(true);
  });

  it("CURRENT immutable except supersede", () => {
    const v = createVersion({ versionNumber: 2 });
    v.approve();
    v.promote(null);
    expect(() => v.approve()).toThrow(InvalidKnowledgeStateError);
  });

  it("superseded immutable", () => {
    const v = createVersion({ versionNumber: 3 });
    v.approve();
    v.promote(null);
    v.supersede();
    expect(() => v.promote(null)).toThrow(InvalidKnowledgeStateError);
  });

  it("rejects illegal transition", () => {
    const v = createVersion({ versionNumber: 4 });
    expect(() => v.promote(null)).toThrow(InvalidKnowledgeStateError);
  });

  it("requires article id", () => {
    expect(() =>
      KnowledgeVersion.create({
        organizationId: orgId,
        articleId: "" as never,
        versionNumber: 1,
        summary: "s",
      }),
    ).toThrow(InvalidKnowledgeStateError);
  });

  it("reconstitutes", () => {
    const v = createVersion({ versionNumber: 5, summary: "rev" });
    expect(
      KnowledgeVersion.reconstitute(v.toSnapshot()).summary.value,
    ).toBe("rev");
  });
});

describe("KnowledgeCategory aggregate", () => {
  it("creates ACTIVE with event", () => {
    const c = KnowledgeCategory.create({
      organizationId: orgId,
      name: "SOPs",
      description: "Procedures",
    });
    expect(c.status).toBe(CategoryStatus.ACTIVE);
    expect(c.isActive).toBe(true);
    expect(c.pullDomainEvents()[0]).toBeInstanceOf(KnowledgeCategoryCreated);
  });

  it("rename and archive", () => {
    const c = KnowledgeCategory.create({
      organizationId: orgId,
      name: "Templates",
    });
    c.pullDomainEvents();
    c.rename("Official Templates");
    expect(c.name.value).toBe("Official Templates");
    c.archive();
    expect(c.isArchived).toBe(true);
    expect(c.pullDomainEvents()[0]).toBeInstanceOf(KnowledgeCategoryArchived);
  });

  it("archived immutable", () => {
    const c = KnowledgeCategory.create({
      organizationId: orgId,
      name: "X",
    });
    c.archive();
    expect(() => c.rename("Y")).toThrow(InvalidKnowledgeStateError);
    expect(() => c.archive()).toThrow(InvalidKnowledgeStateError);
  });

  it("requires organization", () => {
    expect(() =>
      KnowledgeCategory.create({
        organizationId: "" as never,
        name: "N",
      }),
    ).toThrow(InvalidKnowledgeStateError);
  });

  it("reconstitutes", () => {
    const c = KnowledgeCategory.create({
      organizationId: orgId,
      name: "Snap",
    });
    expect(KnowledgeCategory.reconstitute(c.toSnapshot()).name.value).toBe(
      "Snap",
    );
  });
});

describe("KnowledgeReference aggregate", () => {
  it("creates directed relationship", () => {
    const r = KnowledgeReference.create({
      organizationId: orgId,
      sourceArticleId: asKnowledgeArticleId("a1"),
      targetArticleId: asKnowledgeArticleId("a2"),
      relationshipType: RelationshipType.REFERENCES,
      label: "see also",
    });
    expect(r.isActive).toBe(true);
    expect(r.relationshipType).toBe(RelationshipType.REFERENCES);
    expect(r.pullDomainEvents()[0]).toBeInstanceOf(KnowledgeReferenceCreated);
  });

  it("rejects self-reference", () => {
    expect(() =>
      KnowledgeReference.create({
        organizationId: orgId,
        sourceArticleId: asKnowledgeArticleId("a1"),
        targetArticleId: asKnowledgeArticleId("a1"),
        relationshipType: RelationshipType.RELATED_TO,
      }),
    ).toThrow(KnowledgeValidationError);
  });

  it("remove sets REMOVED", () => {
    const r = KnowledgeReference.create({
      organizationId: orgId,
      sourceArticleId: asKnowledgeArticleId("a1"),
      targetArticleId: asKnowledgeArticleId("a2"),
      relationshipType: RelationshipType.SUPERSEDES,
    });
    r.pullDomainEvents();
    r.remove();
    expect(r.isActive).toBe(false);
    expect(r.pullDomainEvents()[0]).toBeInstanceOf(KnowledgeReferenceRemoved);
    expect(() => r.remove()).toThrow(InvalidKnowledgeStateError);
  });

  it("identity immutable after create", () => {
    const r = KnowledgeReference.create({
      organizationId: orgId,
      sourceArticleId: asKnowledgeArticleId("s"),
      targetArticleId: asKnowledgeArticleId("t"),
      relationshipType: RelationshipType.DEPENDS_ON,
    });
    expect(r.sourceArticleId).toBe("s");
    expect(r.targetArticleId).toBe("t");
    // no setters for identity fields
  });

  it("reconstitutes", () => {
    const r = KnowledgeReference.create({
      organizationId: orgId,
      sourceArticleId: asKnowledgeArticleId("s"),
      targetArticleId: asKnowledgeArticleId("t"),
      relationshipType: RelationshipType.IMPLEMENTS,
    });
    expect(
      KnowledgeReference.reconstitute(r.toSnapshot()).relationshipType,
    ).toBe(RelationshipType.IMPLEMENTS);
  });

  it("rejects missing articles", () => {
    expect(() =>
      KnowledgeReference.create({
        organizationId: orgId,
        sourceArticleId: "" as never,
        targetArticleId: asKnowledgeArticleId("t"),
        relationshipType: RelationshipType.RELATED_TO,
      }),
    ).toThrow(KnowledgeValidationError);
  });
});
