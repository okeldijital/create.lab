import type { KnowledgeArticleId, KnowledgeReference, KnowledgeReferenceId, KnowledgeReferenceRepository, RelationshipType } from "@creative-lab/knowledge";
import { and, eq } from "drizzle-orm";
import type { OrganizationId } from "@creative-lab/organization";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { KnowledgeReferenceMapper } from "./mappers.js";
import { knowledgeReferences } from "./schema.js";

export class PostgresKnowledgeReferenceRepository implements KnowledgeReferenceRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: KnowledgeReferenceId): Promise<KnowledgeReference | null> {
    const rows = await this.db.select().from(knowledgeReferences).where(eq(knowledgeReferences.id, id)).limit(1);
    return rows[0] ? KnowledgeReferenceMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<KnowledgeReference[]> {
    const rows = await this.db.select().from(knowledgeReferences).where(eq(knowledgeReferences.organizationId, organizationId));
    return rows.map(KnowledgeReferenceMapper.fromRow);
  }

  async findBySource(sourceArticleId: KnowledgeArticleId): Promise<KnowledgeReference[]> {
    const rows = await this.db.select().from(knowledgeReferences).where(eq(knowledgeReferences.sourceArticleId, sourceArticleId));
    return rows.map(KnowledgeReferenceMapper.fromRow);
  }

  async findByTarget(targetArticleId: KnowledgeArticleId): Promise<KnowledgeReference[]> {
    const rows = await this.db.select().from(knowledgeReferences).where(eq(knowledgeReferences.targetArticleId, targetArticleId));
    return rows.map(KnowledgeReferenceMapper.fromRow);
  }

  async findByRelationship(sourceArticleId: KnowledgeArticleId, targetArticleId: KnowledgeArticleId, relationshipType: RelationshipType): Promise<KnowledgeReference | null> {
    const rows = await this.db.select().from(knowledgeReferences).where(and(eq(knowledgeReferences.sourceArticleId, sourceArticleId), eq(knowledgeReferences.targetArticleId, targetArticleId), eq(knowledgeReferences.relationshipType, relationshipType))).limit(1);
    return rows[0] ? KnowledgeReferenceMapper.fromRow(rows[0]) : null;
  }

  async save(reference: KnowledgeReference): Promise<void> {
    await this.db.insert(knowledgeReferences).values(KnowledgeReferenceMapper.toRow(reference));
  }

  async update(reference: KnowledgeReference): Promise<void> {
    const row = KnowledgeReferenceMapper.toRow(reference);
    await this.db.update(knowledgeReferences).set(row).where(eq(knowledgeReferences.id, reference.id));
  }

  async archive(id: KnowledgeReferenceId): Promise<void> {
    await this.db.update(knowledgeReferences).set({ status: "REMOVED", updatedAt: new Date() }).where(eq(knowledgeReferences.id, id));
  }

  async exists(id: KnowledgeReferenceId): Promise<boolean> {
    const rows = await this.db.select({ id: knowledgeReferences.id }).from(knowledgeReferences).where(eq(knowledgeReferences.id, id)).limit(1);
    return rows.length > 0;
  }
}
