import { bigint, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { organizations } from "../organization/schema.js";

export const knowledgeCategories = pgTable(
  "knowledge_categories",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({
    organizationIndex: index("knowledge_categories_organization_idx").on(table.organizationId),
    nameUnique: uniqueIndex("knowledge_categories_org_name_unique").on(table.organizationId, table.name),
    statusIndex: index("knowledge_categories_status_idx").on(table.status),
  }),
);

export const knowledgeArticles = pgTable(
  "knowledge_articles",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    articleNumber: text("article_number").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    categoryId: uuid("category_id").notNull().references(() => knowledgeCategories.id),
    currentVersionId: uuid("current_version_id"),
    referenceIds: uuid("reference_ids").array().notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({
    organizationIndex: index("knowledge_articles_organization_idx").on(table.organizationId),
    categoryIndex: index("knowledge_articles_category_idx").on(table.categoryId),
    currentVersionIndex: index("knowledge_articles_current_version_idx").on(table.currentVersionId),
    statusIndex: index("knowledge_articles_status_idx").on(table.status),
    numberUnique: uniqueIndex("knowledge_articles_org_number_unique").on(table.organizationId, table.articleNumber),
  }),
);

export const knowledgeVersions = pgTable(
  "knowledge_versions",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    articleId: uuid("article_id").notNull().references(() => knowledgeArticles.id),
    versionNumber: bigint("version_number", { mode: "number" }).notNull(),
    summary: text("summary").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    articleIndex: index("knowledge_versions_article_idx").on(table.articleId),
    organizationIndex: index("knowledge_versions_organization_idx").on(table.organizationId),
    statusIndex: index("knowledge_versions_status_idx").on(table.status),
    versionUnique: uniqueIndex("knowledge_versions_article_version_unique").on(table.articleId, table.versionNumber),
  }),
);

export const knowledgeReferences = pgTable(
  "knowledge_references",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    sourceArticleId: uuid("source_article_id").notNull().references(() => knowledgeArticles.id),
    targetArticleId: uuid("target_article_id").notNull().references(() => knowledgeArticles.id),
    relationshipType: text("relationship_type").notNull(),
    label: text("label"),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("knowledge_references_organization_idx").on(table.organizationId),
    sourceIndex: index("knowledge_references_source_idx").on(table.sourceArticleId),
    targetIndex: index("knowledge_references_target_idx").on(table.targetArticleId),
    relationshipIndex: index("knowledge_references_relationship_idx").on(table.relationshipType),
    identityUnique: uniqueIndex("knowledge_references_identity_unique").on(table.sourceArticleId, table.targetArticleId, table.relationshipType),
  }),
);

export const knowledgeSchema = {
  knowledgeCategories,
  knowledgeArticles,
  knowledgeVersions,
  knowledgeReferences,
};
