import type { KnowledgeArticle, KnowledgeArticleId, KnowledgeArticleRepository, KnowledgeCategoryId, KnowledgeStatus } from "@creative-lab/knowledge";
import { and, eq } from "drizzle-orm";
import type { OrganizationId } from "@creative-lab/organization";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { KnowledgeArticleMapper } from "./mappers.js";
import { knowledgeArticles } from "./schema.js";

export class PostgresKnowledgeArticleRepository implements KnowledgeArticleRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: KnowledgeArticleId): Promise<KnowledgeArticle | null> {
    const rows = await this.db.select().from(knowledgeArticles).where(eq(knowledgeArticles.id, id)).limit(1);
    return rows[0] ? KnowledgeArticleMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<KnowledgeArticle[]> {
    const rows = await this.db.select().from(knowledgeArticles).where(eq(knowledgeArticles.organizationId, organizationId));
    return rows.map(KnowledgeArticleMapper.fromRow);
  }

  async findByCategory(categoryId: KnowledgeCategoryId): Promise<KnowledgeArticle[]> {
    const rows = await this.db.select().from(knowledgeArticles).where(eq(knowledgeArticles.categoryId, categoryId));
    return rows.map(KnowledgeArticleMapper.fromRow);
  }

  async findByStatus(status: KnowledgeStatus): Promise<KnowledgeArticle[]> {
    const rows = await this.db.select().from(knowledgeArticles).where(eq(knowledgeArticles.status, status));
    return rows.map(KnowledgeArticleMapper.fromRow);
  }

  async findByArticleNumber(organizationId: OrganizationId, articleNumber: string): Promise<KnowledgeArticle | null> {
    const rows = await this.db.select().from(knowledgeArticles).where(and(eq(knowledgeArticles.organizationId, organizationId), eq(knowledgeArticles.articleNumber, articleNumber))).limit(1);
    return rows[0] ? KnowledgeArticleMapper.fromRow(rows[0]) : null;
  }

  async save(article: KnowledgeArticle): Promise<void> {
    await this.db.insert(knowledgeArticles).values(KnowledgeArticleMapper.toRow(article));
  }

  async update(article: KnowledgeArticle): Promise<void> {
    const row = KnowledgeArticleMapper.toRow(article);
    await this.db.update(knowledgeArticles).set(row).where(eq(knowledgeArticles.id, article.id));
  }

  async archive(id: KnowledgeArticleId): Promise<void> {
    const now = new Date();
    await this.db.update(knowledgeArticles).set({ status: "ARCHIVED", archivedAt: now, updatedAt: now }).where(eq(knowledgeArticles.id, id));
  }

  async exists(id: KnowledgeArticleId): Promise<boolean> {
    const rows = await this.db.select({ id: knowledgeArticles.id }).from(knowledgeArticles).where(eq(knowledgeArticles.id, id)).limit(1);
    return rows.length > 0;
  }
}
