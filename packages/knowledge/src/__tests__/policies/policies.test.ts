import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { KnowledgeArticle } from "../../aggregates/KnowledgeArticle/KnowledgeArticle.js";
import { KnowledgeCategory } from "../../aggregates/KnowledgeCategory/KnowledgeCategory.js";
import { KnowledgeReference } from "../../aggregates/KnowledgeReference/KnowledgeReference.js";
import { KnowledgeVersion } from "../../aggregates/KnowledgeVersion/KnowledgeVersion.js";
import { KnowledgeStatus } from "../../enums/KnowledgeStatus.js";
import { RelationshipType } from "../../enums/RelationshipType.js";
import { VersionStatus } from "../../enums/VersionStatus.js";
import {
  CategoryInUseError,
  DuplicateCategoryNameError,
  DuplicateKnowledgeReferenceError,
  InvalidKnowledgeStateError,
  KnowledgeValidationError,
} from "../../errors/KnowledgeErrors.js";
import { CategoryPolicy } from "../../policies/CategoryPolicy.js";
import { KnowledgeLifecyclePolicy } from "../../policies/KnowledgeLifecyclePolicy.js";
import { ReferencePolicy } from "../../policies/ReferencePolicy.js";
import { VersionPolicy } from "../../policies/VersionPolicy.js";
import {
  asKnowledgeArticleId,
  asKnowledgeCategoryId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const catId = asKnowledgeCategoryId("cat-1");

function article(number: string) {
  return KnowledgeArticle.create({
    organizationId: orgId,
    title: "T",
    categoryId: catId,
    articleNumber: number,
  });
}

function version(n: number, articleId = asKnowledgeArticleId("a1")) {
  return KnowledgeVersion.create({
    organizationId: orgId,
    articleId,
    versionNumber: n,
    summary: `v${n}`,
  });
}

describe("KnowledgeLifecyclePolicy", () => {
  it("allows valid transitions", () => {
    const a = article("L1");
    expect(() =>
      KnowledgeLifecyclePolicy.assertCanTransition(a, KnowledgeStatus.REVIEW),
    ).not.toThrow();
  });

  it("rejects illegal transitions", () => {
    const a = article("L2");
    expect(() =>
      KnowledgeLifecyclePolicy.assertCanTransition(a, KnowledgeStatus.ACTIVE),
    ).toThrow(InvalidKnowledgeStateError);
  });

  it("blocks archived mutations", () => {
    const a = article("L3");
    a.archive();
    expect(() => KnowledgeLifecyclePolicy.assertMutable(a)).toThrow(
      InvalidKnowledgeStateError,
    );
  });

  it("assertCanActivate requires current version", () => {
    const a = article("L4");
    a.submitForReview();
    a.approve();
    expect(() => KnowledgeLifecyclePolicy.assertCanActivate(a)).toThrow(
      InvalidKnowledgeStateError,
    );
  });

  it("assertCategoryMutable blocks after ACTIVE", () => {
    const a = article("L5");
    a.setCurrentVersion("v1" as never);
    a.submitForReview();
    a.approve();
    a.activate();
    expect(() => KnowledgeLifecyclePolicy.assertCategoryMutable(a)).toThrow(
      InvalidKnowledgeStateError,
    );
  });

  it("retired is not structurally editable", () => {
    const a = article("L6");
    a.setCurrentVersion("v1" as never);
    a.submitForReview();
    a.approve();
    a.activate();
    a.retire();
    expect(() =>
      KnowledgeLifecyclePolicy.assertStructurallyEditable(a),
    ).toThrow(InvalidKnowledgeStateError);
  });
});

describe("VersionPolicy", () => {
  it("sequential numbering from null starts at 1", () => {
    expect(() => VersionPolicy.assertSequential(1, null)).not.toThrow();
    expect(() => VersionPolicy.assertSequential(2, null)).toThrow(
      InvalidKnowledgeStateError,
    );
  });

  it("sequential numbering increments", () => {
    expect(() => VersionPolicy.assertSequential(3, 2)).not.toThrow();
    expect(() => VersionPolicy.assertSequential(5, 2)).toThrow(
      InvalidKnowledgeStateError,
    );
  });

  it("assertCanPromote from APPROVED", () => {
    const v = version(1);
    v.approve();
    expect(() => VersionPolicy.assertCanPromote(v)).not.toThrow();
  });

  it("assertCanPromote rejects DRAFT", () => {
    const v = version(2);
    expect(() => VersionPolicy.assertCanPromote(v)).toThrow(
      InvalidKnowledgeStateError,
    );
  });

  it("assertCanSupersede only CURRENT", () => {
    const v = version(3);
    v.approve();
    expect(() => VersionPolicy.assertCanSupersede(v)).toThrow(
      InvalidKnowledgeStateError,
    );
    v.promote(null);
    expect(() => VersionPolicy.assertCanSupersede(v)).not.toThrow();
  });

  it("assertSingleCurrent detects multiples", () => {
    const v1 = version(1);
    v1.approve();
    v1.promote(null);
    const v2 = version(2);
    v2.approve();
    // reconstitute as current to simulate bad state
    const bad = KnowledgeVersion.reconstitute({
      ...v2.toSnapshot(),
      status: VersionStatus.CURRENT,
    });
    expect(() => VersionPolicy.assertSingleCurrent([v1, bad])).toThrow(
      InvalidKnowledgeStateError,
    );
  });

  it("assertCanTransition rejects CURRENT to APPROVED", () => {
    const v = version(4);
    v.approve();
    v.promote(null);
    expect(() =>
      VersionPolicy.assertCanTransition(v, VersionStatus.APPROVED),
    ).toThrow(InvalidKnowledgeStateError);
  });
});

describe("CategoryPolicy", () => {
  it("unique name", () => {
    const existing = KnowledgeCategory.create({
      organizationId: orgId,
      name: "SOPs",
    });
    expect(() =>
      CategoryPolicy.assertUniqueName("SOPs", orgId, existing),
    ).toThrow(DuplicateCategoryNameError);
    expect(() =>
      CategoryPolicy.assertUniqueName("Other", orgId, null),
    ).not.toThrow();
  });

  it("cannot archive while ACTIVE articles exist", () => {
    const cat = KnowledgeCategory.create({
      organizationId: orgId,
      name: "ActiveCat",
      id: catId,
    });
    const a = KnowledgeArticle.create({
      organizationId: orgId,
      title: "A",
      categoryId: cat.id,
      articleNumber: "CA1",
    });
    a.setCurrentVersion("v1" as never);
    a.submitForReview();
    a.approve();
    a.activate();
    expect(() => CategoryPolicy.assertCanArchive(cat, [a])).toThrow(
      CategoryInUseError,
    );
  });

  it("can archive when no active articles", () => {
    const cat = KnowledgeCategory.create({
      organizationId: orgId,
      name: "Empty",
    });
    const a = article("CA2");
    // DRAFT not ACTIVE
    expect(() => CategoryPolicy.assertCanArchive(cat, [a])).not.toThrow();
  });

  it("assertMutable blocks archived", () => {
    const cat = KnowledgeCategory.create({
      organizationId: orgId,
      name: "Arch",
    });
    cat.archive();
    expect(() => CategoryPolicy.assertMutable(cat)).toThrow(
      InvalidKnowledgeStateError,
    );
  });
});

describe("ReferencePolicy", () => {
  it("no self-reference", () => {
    const id = asKnowledgeArticleId("same");
    expect(() => ReferencePolicy.assertNoSelfReference(id, id)).toThrow(
      KnowledgeValidationError,
    );
  });

  it("duplicate relationships rejected", () => {
    const s = asKnowledgeArticleId("s");
    const t = asKnowledgeArticleId("t");
    const existing = KnowledgeReference.create({
      organizationId: orgId,
      sourceArticleId: s,
      targetArticleId: t,
      relationshipType: RelationshipType.REFERENCES,
    });
    expect(() =>
      ReferencePolicy.assertUniqueRelationship(
        s,
        t,
        RelationshipType.REFERENCES,
        existing,
      ),
    ).toThrow(DuplicateKnowledgeReferenceError);
  });

  it("assertCanCreate combines checks", () => {
    const s = asKnowledgeArticleId("s2");
    const t = asKnowledgeArticleId("t2");
    expect(() =>
      ReferencePolicy.assertCanCreate(s, t, RelationshipType.RELATED_TO, null),
    ).not.toThrow();
    expect(() =>
      ReferencePolicy.assertCanCreate(s, s, RelationshipType.RELATED_TO, null),
    ).toThrow(KnowledgeValidationError);
  });

  it("assertActive rejects removed", () => {
    const r = KnowledgeReference.create({
      organizationId: orgId,
      sourceArticleId: asKnowledgeArticleId("s3"),
      targetArticleId: asKnowledgeArticleId("t3"),
      relationshipType: RelationshipType.DEPENDS_ON,
    });
    r.remove();
    expect(() => ReferencePolicy.assertActive(r)).toThrow(
      InvalidKnowledgeStateError,
    );
  });
});
