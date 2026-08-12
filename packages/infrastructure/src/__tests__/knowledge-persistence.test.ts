import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  KnowledgeArticle,
  KnowledgeCategory,
  KnowledgeReference,
  KnowledgeVersion,
  RelationshipType,
} from "@creative-lab/knowledge";
import type { OrganizationId } from "@creative-lab/organization";
import {
  KnowledgeArticleMapper,
  KnowledgeCategoryMapper,
  KnowledgeReferenceMapper,
  KnowledgeVersionMapper,
} from "../persistence/knowledge/mappers.js";

const id = (): string => randomUUID();
const organizationId = id() as OrganizationId;
const now = new Date("2026-01-01T00:00:00.000Z");

const category = KnowledgeCategory.create({
  id: id(),
  organizationId,
  name: "Operations",
  description: "Operational knowledge",
  now,
});

const article = KnowledgeArticle.create({
  id: id(),
  organizationId,
  title: "Release procedure",
  description: "Procedure for releases",
  categoryId: category.id,
  articleNumber: "KB-2026-0001",
  now,
});

const version = KnowledgeVersion.create({
  id: id(),
  organizationId,
  articleId: article.id,
  versionNumber: 1,
  summary: "Initial release procedure",
  now,
});

const reference = KnowledgeReference.create({
  id: id(),
  organizationId,
  sourceArticleId: article.id,
  targetArticleId: KnowledgeArticle.create({
    id: id(),
    organizationId,
    title: "Related procedure",
    categoryId: category.id,
    now,
  }).id,
  relationshipType: RelationshipType.RELATED_TO,
  label: "Related procedure",
  now,
});


describe("Knowledge persistence mappers", () => {
  it("round-trips KnowledgeCategory", () => {
    const restored = KnowledgeCategoryMapper.fromRow(KnowledgeCategoryMapper.toRow(category));
    expect(restored.toSnapshot()).toEqual(category.toSnapshot());
  });

  it("round-trips KnowledgeArticle including current version and references", () => {
    article.setCurrentVersion(version.id, now);
    article.addReferenceId(reference.id, now);
    const restored = KnowledgeArticleMapper.fromRow(KnowledgeArticleMapper.toRow(article));
    expect(restored.toSnapshot()).toEqual(article.toSnapshot());
  });

  it("round-trips KnowledgeVersion", () => {
    const restored = KnowledgeVersionMapper.fromRow(KnowledgeVersionMapper.toRow(version));
    expect(restored.toSnapshot()).toEqual(version.toSnapshot());
    expect(restored.versionNumber).toBe(1);
  });

  it("round-trips KnowledgeReference", () => {
    const restored = KnowledgeReferenceMapper.fromRow(KnowledgeReferenceMapper.toRow(reference));
    expect(restored.toSnapshot()).toEqual(reference.toSnapshot());
    expect(restored.sourceArticleId).toBe(reference.sourceArticleId);
    expect(restored.targetArticleId).toBe(reference.targetArticleId);
  });
});
