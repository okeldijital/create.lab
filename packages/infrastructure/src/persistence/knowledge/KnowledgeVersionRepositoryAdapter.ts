import type { KnowledgeArticleId, KnowledgeVersion, KnowledgeVersionId, KnowledgeVersionRepository, VersionStatus } from "@creative-lab/knowledge";
import { and, eq } from "drizzle-orm";
import type { OrganizationId } from "@creative-lab/organization";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { KnowledgeVersionMapper } from "./mappers.js";
import { knowledgeVersions } from "./schema.js";

export class PostgresKnowledgeVersionRepository implements KnowledgeVersionRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: KnowledgeVersionId): Promise<KnowledgeVersion | null> {
    const rows = await this.db.select().from(knowledgeVersions).where(eq(knowledgeVersions.id, id)).limit(1);
    return rows[0] ? KnowledgeVersionMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<KnowledgeVersion[]> {
    const rows = await this.db.select().from(knowledgeVersions).where(eq(knowledgeVersions.organizationId, organizationId));
    return rows.map(KnowledgeVersionMapper.fromRow);
  }

  async findByArticle(articleId: KnowledgeArticleId): Promise<KnowledgeVersion[]> {
    const rows = await this.db.select().from(knowledgeVersions).where(eq(knowledgeVersions.articleId, articleId));
    return rows.map(KnowledgeVersionMapper.fromRow);
  }

  async findByStatus(status: VersionStatus): Promise<KnowledgeVersion[]> {
    const rows = await this.db.select().from(knowledgeVersions).where(eq(knowledgeVersions.status, status));
    return rows.map(KnowledgeVersionMapper.fromRow);
  }

  async findCurrentVersion(articleId: KnowledgeArticleId): Promise<KnowledgeVersion | null> {
    const rows = await this.db.select().from(knowledgeVersions).where(and(eq(knowledgeVersions.articleId, articleId), eq(knowledgeVersions.status, "CURRENT"))).limit(1);
    return rows[0] ? KnowledgeVersionMapper.fromRow(rows[0]) : null;
  }

  async save(version: KnowledgeVersion): Promise<void> {
    await this.db.insert(knowledgeVersions).values(KnowledgeVersionMapper.toRow(version));
  }

  async update(version: KnowledgeVersion): Promise<void> {
    const row = KnowledgeVersionMapper.toRow(version);
    await this.db.update(knowledgeVersions).set(row).where(eq(knowledgeVersions.id, version.id));
  }

  async archive(id: KnowledgeVersionId): Promise<void> {
    await this.db.update(knowledgeVersions).set({ status: "SUPERSEDED", updatedAt: new Date() }).where(eq(knowledgeVersions.id, id));
  }

  async exists(id: KnowledgeVersionId): Promise<boolean> {
    const rows = await this.db.select({ id: knowledgeVersions.id }).from(knowledgeVersions).where(eq(knowledgeVersions.id, id)).limit(1);
    return rows.length > 0;
  }
}
