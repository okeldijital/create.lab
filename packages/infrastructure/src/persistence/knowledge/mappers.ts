import {
  KnowledgeArticle,
  KnowledgeCategory,
  KnowledgeReference,
  KnowledgeVersion,
  asKnowledgeArticleId,
  asKnowledgeCategoryId,
  asKnowledgeReferenceId,
  asKnowledgeVersionId,
  type KnowledgeArticleSnapshot,
  type KnowledgeCategorySnapshot,
  type KnowledgeReferenceSnapshot,
  type KnowledgeVersionSnapshot,
} from "@creative-lab/knowledge";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type {
  knowledgeArticles,
  knowledgeCategories,
  knowledgeReferences,
  knowledgeVersions,
} from "./schema.js";

type CategoryRow = InferSelectModel<typeof knowledgeCategories>;
type ArticleRow = InferSelectModel<typeof knowledgeArticles>;
type VersionRow = InferSelectModel<typeof knowledgeVersions>;
type ReferenceRow = InferSelectModel<typeof knowledgeReferences>;

export const KnowledgeCategoryMapper = {
  toRow(category: KnowledgeCategory): InferInsertModel<typeof knowledgeCategories> {
    const snapshot = category.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      name: snapshot.name,
      description: snapshot.description,
      status: snapshot.status,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      archivedAt: snapshot.archivedAt,
    };
  },
  fromRow(row: CategoryRow): KnowledgeCategory {
    const snapshot: KnowledgeCategorySnapshot = {
      id: asKnowledgeCategoryId(row.id),
      organizationId: row.organizationId as KnowledgeCategorySnapshot["organizationId"],
      name: row.name,
      description: row.description,
      status: row.status as KnowledgeCategorySnapshot["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      archivedAt: row.archivedAt,
    };
    return KnowledgeCategory.reconstitute(snapshot);
  },
};

export const KnowledgeArticleMapper = {
  toRow(article: KnowledgeArticle): InferInsertModel<typeof knowledgeArticles> {
    const snapshot = article.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      articleNumber: snapshot.articleNumber,
      title: snapshot.title,
      description: snapshot.description,
      categoryId: snapshot.categoryId,
      currentVersionId: snapshot.currentVersionId,
      referenceIds: snapshot.referenceIds as string[],
      status: snapshot.status,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      archivedAt: snapshot.archivedAt,
    };
  },
  fromRow(row: ArticleRow): KnowledgeArticle {
    const snapshot: KnowledgeArticleSnapshot = {
      id: asKnowledgeArticleId(row.id),
      organizationId: row.organizationId as KnowledgeArticleSnapshot["organizationId"],
      articleNumber: row.articleNumber,
      title: row.title,
      description: row.description,
      categoryId: asKnowledgeCategoryId(row.categoryId),
      currentVersionId: row.currentVersionId ? asKnowledgeVersionId(row.currentVersionId) : null,
      referenceIds: (row.referenceIds ?? []).map(asKnowledgeReferenceId),
      status: row.status as KnowledgeArticleSnapshot["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      archivedAt: row.archivedAt,
    };
    return KnowledgeArticle.reconstitute(snapshot);
  },
};

export const KnowledgeVersionMapper = {
  toRow(version: KnowledgeVersion): InferInsertModel<typeof knowledgeVersions> {
    const snapshot = version.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      articleId: snapshot.articleId,
      versionNumber: snapshot.versionNumber,
      summary: snapshot.summary,
      status: snapshot.status,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  },
  fromRow(row: VersionRow): KnowledgeVersion {
    const snapshot: KnowledgeVersionSnapshot = {
      id: asKnowledgeVersionId(row.id),
      organizationId: row.organizationId as KnowledgeVersionSnapshot["organizationId"],
      articleId: asKnowledgeArticleId(row.articleId),
      versionNumber: Number(row.versionNumber),
      summary: row.summary,
      status: row.status as KnowledgeVersionSnapshot["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return KnowledgeVersion.reconstitute(snapshot);
  },
};

export const KnowledgeReferenceMapper = {
  toRow(reference: KnowledgeReference): InferInsertModel<typeof knowledgeReferences> {
    const snapshot = reference.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      sourceArticleId: snapshot.sourceArticleId,
      targetArticleId: snapshot.targetArticleId,
      relationshipType: snapshot.relationshipType,
      label: snapshot.label,
      status: snapshot.status,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  },
  fromRow(row: ReferenceRow): KnowledgeReference {
    const snapshot: KnowledgeReferenceSnapshot = {
      id: asKnowledgeReferenceId(row.id),
      organizationId: row.organizationId as KnowledgeReferenceSnapshot["organizationId"],
      sourceArticleId: asKnowledgeArticleId(row.sourceArticleId),
      targetArticleId: asKnowledgeArticleId(row.targetArticleId),
      relationshipType: row.relationshipType as KnowledgeReferenceSnapshot["relationshipType"],
      label: row.label,
      status: row.status as KnowledgeReferenceSnapshot["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return KnowledgeReference.reconstitute(snapshot);
  },
};
