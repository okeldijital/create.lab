import type { KnowledgeCategory, KnowledgeCategoryId, KnowledgeCategoryRepository, KnowledgeStatus as _Unused } from "@creative-lab/knowledge";
import { eq, and } from "drizzle-orm";
import type { OrganizationId } from "@creative-lab/organization";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { knowledgeCategories } from "./schema.js";
import { KnowledgeCategoryMapper } from "./mappers.js";

export class PostgresKnowledgeCategoryRepository implements KnowledgeCategoryRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: KnowledgeCategoryId): Promise<KnowledgeCategory | null> {
    const rows = await this.db.select().from(knowledgeCategories).where(eq(knowledgeCategories.id, id)).limit(1);
    return rows[0] ? KnowledgeCategoryMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<KnowledgeCategory[]> {
    const rows = await this.db.select().from(knowledgeCategories).where(eq(knowledgeCategories.organizationId, organizationId));
    return rows.map(KnowledgeCategoryMapper.fromRow);
  }

  async findByStatus(status: "ACTIVE" | "ARCHIVED"): Promise<KnowledgeCategory[]> {
    const rows = await this.db.select().from(knowledgeCategories).where(eq(knowledgeCategories.status, status));
    return rows.map(KnowledgeCategoryMapper.fromRow);
  }

  async findByName(organizationId: OrganizationId, name: string): Promise<KnowledgeCategory | null> {
    const rows = await this.db.select().from(knowledgeCategories).where(and(eq(knowledgeCategories.organizationId, organizationId), eq(knowledgeCategories.name, name))).limit(1);
    return rows[0] ? KnowledgeCategoryMapper.fromRow(rows[0]) : null;
  }

  async save(category: KnowledgeCategory): Promise<void> {
    await this.db.insert(knowledgeCategories).values(KnowledgeCategoryMapper.toRow(category));
  }

  async update(category: KnowledgeCategory): Promise<void> {
    const row = KnowledgeCategoryMapper.toRow(category);
    await this.db.update(knowledgeCategories).set(row).where(eq(knowledgeCategories.id, category.id));
  }

  async archive(id: KnowledgeCategoryId): Promise<void> {
    const now = new Date();
    await this.db.update(knowledgeCategories).set({ status: "ARCHIVED", archivedAt: now, updatedAt: now }).where(eq(knowledgeCategories.id, id));
  }

  async exists(id: KnowledgeCategoryId): Promise<boolean> {
    const rows = await this.db.select({ id: knowledgeCategories.id }).from(knowledgeCategories).where(eq(knowledgeCategories.id, id)).limit(1);
    return rows.length > 0;
  }
}
