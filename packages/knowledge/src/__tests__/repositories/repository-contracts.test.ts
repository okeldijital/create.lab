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
import type { KnowledgeArticleRepository } from "../../repositories/KnowledgeArticleRepository.js";
import type { KnowledgeCategoryRepository } from "../../repositories/KnowledgeCategoryRepository.js";
import type { KnowledgeReferenceRepository } from "../../repositories/KnowledgeReferenceRepository.js";
import type { KnowledgeVersionRepository } from "../../repositories/KnowledgeVersionRepository.js";
import {
  InMemoryKnowledgeArticleRepository,
  InMemoryKnowledgeCategoryRepository,
  InMemoryKnowledgeReferenceRepository,
  InMemoryKnowledgeVersionRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");

function assertPortMethods(
  repo: object,
  methods: string[],
): void {
  for (const m of methods) {
    expect(typeof (repo as Record<string, unknown>)[m]).toBe("function");
  }
}

describe("Repository contracts", () => {
  it("KnowledgeArticleRepository port compliance", async () => {
    const repo: KnowledgeArticleRepository =
      new InMemoryKnowledgeArticleRepository();
    assertPortMethods(repo, [
      "findById",
      "findByOrganization",
      "findByCategory",
      "findByStatus",
      "findByArticleNumber",
      "save",
      "update",
      "archive",
      "exists",
    ]);
    const cat = KnowledgeCategory.create({
      organizationId: orgId,
      name: "C",
    });
    const article = KnowledgeArticle.create({
      organizationId: orgId,
      title: "T",
      categoryId: cat.id,
      articleNumber: "R-1",
    });
    await repo.save(article);
    expect(await repo.exists(article.id)).toBe(true);
    expect((await repo.findByOrganization(orgId)).length).toBe(1);
    expect((await repo.findByCategory(cat.id)).length).toBe(1);
    expect((await repo.findByStatus(KnowledgeStatus.DRAFT)).length).toBe(1);
    expect(
      (await repo.findByArticleNumber(orgId, "R-1"))?.id,
    ).toBe(article.id);
    await repo.update(article);
    await repo.archive(article.id);
  });

  it("KnowledgeVersionRepository port compliance", async () => {
    const repo: KnowledgeVersionRepository =
      new InMemoryKnowledgeVersionRepository();
    assertPortMethods(repo, [
      "findById",
      "findByOrganization",
      "findByArticle",
      "findByStatus",
      "findCurrentVersion",
      "save",
      "update",
      "archive",
      "exists",
    ]);
    const article = KnowledgeArticle.create({
      organizationId: orgId,
      title: "T",
      categoryId: "c" as never,
      articleNumber: "V-1",
    });
    const version = KnowledgeVersion.create({
      organizationId: orgId,
      articleId: article.id,
      versionNumber: 1,
      summary: "s",
    });
    await repo.save(version);
    expect((await repo.findByArticle(article.id)).length).toBe(1);
    expect((await repo.findByStatus(VersionStatus.DRAFT)).length).toBe(1);
    version.approve();
    version.promote(null);
    await repo.update(version);
    expect((await repo.findCurrentVersion(article.id))?.id).toBe(version.id);
    await repo.archive(version.id);
  });

  it("KnowledgeCategoryRepository port compliance", async () => {
    const repo: KnowledgeCategoryRepository =
      new InMemoryKnowledgeCategoryRepository();
    assertPortMethods(repo, [
      "findById",
      "findByOrganization",
      "findByStatus",
      "findByName",
      "save",
      "update",
      "archive",
      "exists",
    ]);
    const cat = KnowledgeCategory.create({
      organizationId: orgId,
      name: "Port",
    });
    await repo.save(cat);
    expect((await repo.findByName(orgId, "Port"))?.id).toBe(cat.id);
    expect((await repo.findByStatus(CategoryStatus.ACTIVE)).length).toBe(1);
    await repo.update(cat);
    await repo.archive(cat.id);
  });

  it("KnowledgeReferenceRepository port compliance", async () => {
    const repo: KnowledgeReferenceRepository =
      new InMemoryKnowledgeReferenceRepository();
    assertPortMethods(repo, [
      "findById",
      "findByOrganization",
      "findBySource",
      "findByTarget",
      "findByRelationship",
      "save",
      "update",
      "archive",
      "exists",
    ]);
    const ref = KnowledgeReference.create({
      organizationId: orgId,
      sourceArticleId: "s" as never,
      targetArticleId: "t" as never,
      relationshipType: RelationshipType.RELATED_TO,
    });
    await repo.save(ref);
    expect((await repo.findBySource("s" as never)).length).toBe(1);
    expect((await repo.findByTarget("t" as never)).length).toBe(1);
    expect(
      (
        await repo.findByRelationship(
          "s" as never,
          "t" as never,
          RelationshipType.RELATED_TO,
        )
      )?.id,
    ).toBe(ref.id);
    await repo.update(ref);
    await repo.archive(ref.id);
  });
});
