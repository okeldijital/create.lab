import { describe, expect, it, beforeEach } from "vitest";
import { Organization, asOrganizationId } from "@creative-lab/organization";
import { KnowledgeStatus } from "../../enums/KnowledgeStatus.js";
import { RelationshipType } from "../../enums/RelationshipType.js";
import {
  CategoryInUseError,
  DuplicateArticleNumberError,
  DuplicateCategoryNameError,
  DuplicateKnowledgeReferenceError,
  InvalidKnowledgeStateError,
  KnowledgeArticleNotFoundError,
  KnowledgeCategoryNotFoundError,
  KnowledgeReferenceNotFoundError,
  KnowledgeValidationError,
  KnowledgeVersionNotFoundError,
} from "../../errors/KnowledgeErrors.js";
import {
  KnowledgeActivated,
  KnowledgeArticleCreated,
  KnowledgeCategoryCreated,
  KnowledgeReferenceCreated,
  KnowledgeVersionPromoted,
} from "../../events/knowledge-events.js";
import { KnowledgeArticleService } from "../../services/KnowledgeArticleService.js";
import { KnowledgeCategoryService } from "../../services/KnowledgeCategoryService.js";
import { KnowledgeReferenceService } from "../../services/KnowledgeReferenceService.js";
import { KnowledgeVersionService } from "../../services/KnowledgeVersionService.js";
import {
  InMemoryEventPublisher,
  InMemoryKnowledgeArticleRepository,
  InMemoryKnowledgeCategoryRepository,
  InMemoryKnowledgeReferenceRepository,
  InMemoryKnowledgeVersionRepository,
  InMemoryOrganizationRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");

describe("Knowledge services", () => {
  let orgs: InMemoryOrganizationRepository;
  let articles: InMemoryKnowledgeArticleRepository;
  let versions: InMemoryKnowledgeVersionRepository;
  let categories: InMemoryKnowledgeCategoryRepository;
  let references: InMemoryKnowledgeReferenceRepository;
  let events: InMemoryEventPublisher;
  let articleService: KnowledgeArticleService;
  let versionService: KnowledgeVersionService;
  let categoryService: KnowledgeCategoryService;
  let referenceService: KnowledgeReferenceService;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    articles = new InMemoryKnowledgeArticleRepository();
    versions = new InMemoryKnowledgeVersionRepository();
    categories = new InMemoryKnowledgeCategoryRepository();
    references = new InMemoryKnowledgeReferenceRepository();
    events = new InMemoryEventPublisher();
    await orgs.save(
      Organization.create({ name: "Studio", slug: "studio", id: orgId }),
    );
    articleService = new KnowledgeArticleService({
      articleRepository: articles,
      categoryRepository: categories,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    versionService = new KnowledgeVersionService({
      versionRepository: versions,
      articleRepository: articles,
      eventPublisher: events,
    });
    categoryService = new KnowledgeCategoryService({
      categoryRepository: categories,
      articleRepository: articles,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    referenceService = new KnowledgeReferenceService({
      referenceRepository: references,
      articleRepository: articles,
      eventPublisher: events,
    });
  });

  async function seedCategory(name = "SOPs") {
    return categoryService.create({
      organizationId: orgId,
      name,
    });
  }

  async function seedArticle(number = "KNW-SVC-1", categoryName = "SOPs") {
    const cat =
      (await categories.findByName(orgId, categoryName)) ??
      (await seedCategory(categoryName));
    return articleService.create({
      organizationId: orgId,
      title: `Article ${number}`,
      categoryId: cat.id,
      articleNumber: number,
    });
  }

  async function promoteToActive(number: string) {
    const article = await seedArticle(number);
    const v = await versionService.create({
      articleId: article.id,
      summary: "v1",
    });
    await versionService.approve(v.id);
    await versionService.promoteCurrent(v.id);
    await articleService.submitForReview(article.id);
    await articleService.approve(article.id);
    return articleService.activate(article.id);
  }

  // —— Category ——
  it("creates category", async () => {
    const c = await seedCategory("Policies");
    expect(c.name.value).toBe("Policies");
    expect(events.events.some((e) => e instanceof KnowledgeCategoryCreated)).toBe(
      true,
    );
  });

  it("rejects duplicate category name", async () => {
    await seedCategory("Dup");
    await expect(seedCategory("Dup")).rejects.toThrow(DuplicateCategoryNameError);
  });

  it("renames category", async () => {
    const c = await seedCategory("Old");
    const renamed = await categoryService.rename(c.id, "New");
    expect(renamed.name.value).toBe("New");
  });

  it("archives category without active articles", async () => {
    const c = await seedCategory("Empty");
    await seedArticle("DRAFT-ONLY", "Empty");
    const archived = await categoryService.archive(c.id);
    expect(archived.isArchived).toBe(true);
  });

  it("blocks category archive while ACTIVE articles exist", async () => {
    await promoteToActive("ACTIVE-1");
    const cat = (await categories.findByName(orgId, "SOPs"))!;
    await expect(categoryService.archive(cat.id)).rejects.toThrow(
      CategoryInUseError,
    );
  });

  it("category not found", async () => {
    await expect(categoryService.getById("missing" as never)).rejects.toThrow(
      KnowledgeCategoryNotFoundError,
    );
  });

  // —— Article ——
  it("creates article", async () => {
    const a = await seedArticle("A-1");
    expect(a.status).toBe(KnowledgeStatus.DRAFT);
    expect(events.events.some((e) => e instanceof KnowledgeArticleCreated)).toBe(
      true,
    );
  });

  it("rejects duplicate article number", async () => {
    await seedArticle("DUP");
    await expect(seedArticle("DUP")).rejects.toThrow(DuplicateArticleNumberError);
  });

  it("rejects create without category", async () => {
    await expect(
      articleService.create({
        organizationId: orgId,
        title: "X",
        categoryId: "nope" as never,
      }),
    ).rejects.toThrow(KnowledgeCategoryNotFoundError);
  });

  it("article lifecycle through services", async () => {
    const a = await promoteToActive("LIFE");
    expect(a.isActive).toBe(true);
    expect(events.events.some((e) => e instanceof KnowledgeActivated)).toBe(
      true,
    );
    await articleService.retire(a.id);
    const retired = await articleService.getById(a.id);
    expect(retired.isRetired).toBe(true);
    await articleService.archive(a.id);
    expect((await articleService.getById(a.id)).isArchived).toBe(true);
  });

  it("activate without current version fails", async () => {
    const a = await seedArticle("NOVER");
    await articleService.submitForReview(a.id);
    await articleService.approve(a.id);
    await expect(articleService.activate(a.id)).rejects.toThrow(
      InvalidKnowledgeStateError,
    );
  });

  it("article not found", async () => {
    await expect(articleService.getById("x" as never)).rejects.toThrow(
      KnowledgeArticleNotFoundError,
    );
  });

  it("lists by organization category status", async () => {
    await seedArticle("L-1");
    await seedArticle("L-2");
    const list = await articleService.listByOrganization(orgId);
    expect(list.length).toBe(2);
    const drafts = await articleService.listByStatus(KnowledgeStatus.DRAFT);
    expect(drafts.length).toBe(2);
    const cat = (await categories.findByName(orgId, "SOPs"))!;
    expect((await articleService.listByCategory(cat.id)).length).toBe(2);
  });

  // —— Version ——
  it("creates sequential versions", async () => {
    const a = await seedArticle("VER");
    const v1 = await versionService.create({
      articleId: a.id,
      summary: "first",
    });
    expect(v1.versionNumber).toBe(1);
    const v2 = await versionService.create({
      articleId: a.id,
      summary: "second",
    });
    expect(v2.versionNumber).toBe(2);
  });

  it("rejects non-sequential version numbers", async () => {
    const a = await seedArticle("SEQ");
    await versionService.create({ articleId: a.id, summary: "1" });
    await expect(
      versionService.create({
        articleId: a.id,
        summary: "bad",
        versionNumber: 5,
      }),
    ).rejects.toThrow(InvalidKnowledgeStateError);
  });

  it("promotes current and supersedes previous", async () => {
    const a = await seedArticle("PROM");
    const v1 = await versionService.create({
      articleId: a.id,
      summary: "one",
    });
    await versionService.approve(v1.id);
    await versionService.promoteCurrent(v1.id);
    expect((await versionService.getById(v1.id)).isCurrent).toBe(true);
    expect(
      events.events.some((e) => e instanceof KnowledgeVersionPromoted),
    ).toBe(true);
    expect((await articleService.getById(a.id)).currentVersionId).toBe(v1.id);

    const v2 = await versionService.create({
      articleId: a.id,
      summary: "two",
    });
    await versionService.approve(v2.id);
    await versionService.promoteCurrent(v2.id);
    expect((await versionService.getById(v1.id)).isSuperseded).toBe(true);
    expect((await versionService.getById(v2.id)).isCurrent).toBe(true);
    expect((await versionService.findCurrent(a.id))?.id).toBe(v2.id);
  });

  it("version not found", async () => {
    await expect(versionService.getById("x" as never)).rejects.toThrow(
      KnowledgeVersionNotFoundError,
    );
  });

  it("cannot create version for missing article", async () => {
    await expect(
      versionService.create({ articleId: "missing" as never, summary: "x" }),
    ).rejects.toThrow(KnowledgeArticleNotFoundError);
  });

  it("lists versions by article", async () => {
    const a = await seedArticle("LISTV");
    await versionService.create({ articleId: a.id, summary: "1" });
    await versionService.create({ articleId: a.id, summary: "2" });
    expect((await versionService.listByArticle(a.id)).length).toBe(2);
  });

  // —— Reference ——
  it("creates and removes reference", async () => {
    const a1 = await seedArticle("R1");
    const a2 = await seedArticle("R2");
    const ref = await referenceService.create({
      organizationId: orgId,
      sourceArticleId: a1.id,
      targetArticleId: a2.id,
      relationshipType: RelationshipType.REFERENCES,
    });
    expect(ref.isActive).toBe(true);
    expect(
      events.events.some((e) => e instanceof KnowledgeReferenceCreated),
    ).toBe(true);
    expect((await articleService.getById(a1.id)).referenceIds).toContain(
      ref.id,
    );
    await referenceService.remove(ref.id);
    expect((await referenceService.getById(ref.id)).isActive).toBe(false);
    expect((await articleService.getById(a1.id)).referenceIds).not.toContain(
      ref.id,
    );
  });

  it("rejects self-reference via service", async () => {
    const a = await seedArticle("SELF");
    await expect(
      referenceService.create({
        organizationId: orgId,
        sourceArticleId: a.id,
        targetArticleId: a.id,
        relationshipType: RelationshipType.RELATED_TO,
      }),
    ).rejects.toThrow(KnowledgeValidationError);
  });

  it("rejects duplicate reference", async () => {
    const a1 = await seedArticle("D1");
    const a2 = await seedArticle("D2");
    await referenceService.create({
      organizationId: orgId,
      sourceArticleId: a1.id,
      targetArticleId: a2.id,
      relationshipType: RelationshipType.DEPENDS_ON,
    });
    await expect(
      referenceService.create({
        organizationId: orgId,
        sourceArticleId: a1.id,
        targetArticleId: a2.id,
        relationshipType: RelationshipType.DEPENDS_ON,
      }),
    ).rejects.toThrow(DuplicateKnowledgeReferenceError);
  });

  it("reference not found", async () => {
    await expect(referenceService.getById("x" as never)).rejects.toThrow(
      KnowledgeReferenceNotFoundError,
    );
  });

  it("rejects reference to missing target", async () => {
    const a = await seedArticle("TGT");
    await expect(
      referenceService.create({
        organizationId: orgId,
        sourceArticleId: a.id,
        targetArticleId: "missing" as never,
        relationshipType: RelationshipType.SUPERSEDES,
      }),
    ).rejects.toThrow(KnowledgeArticleNotFoundError);
  });
});
