import type { OpportunityRepository, Opportunity, OpportunityId, CustomerId, OpportunityStatus } from "@creative-lab/crm";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { opportunities } from "./schema.js";
import { OpportunityMapper } from "./mappers.js";

export class PostgresOpportunityRepository implements OpportunityRepository {
  constructor(private readonly db: DrizzleDatabase) {}
  async findById(id: OpportunityId): Promise<Opportunity | null> { const rows = await this.db.select().from(opportunities).where(eq(opportunities.id, id)).limit(1); return rows[0] ? OpportunityMapper.fromRow(rows[0]) : null; }
  async findByCustomer(customerId: CustomerId): Promise<Opportunity[]> { const rows = await this.db.select().from(opportunities).where(eq(opportunities.customerId, customerId)); return rows.map(OpportunityMapper.fromRow); }
  async findByStatus(status: OpportunityStatus): Promise<Opportunity[]> { const rows = await this.db.select().from(opportunities).where(eq(opportunities.status, status)); return rows.map(OpportunityMapper.fromRow); }
  async save(opportunity: Opportunity): Promise<void> { await this.db.insert(opportunities).values(OpportunityMapper.toRow(opportunity)); }
  async update(opportunity: Opportunity): Promise<void> { const row = OpportunityMapper.toRow(opportunity); await this.db.update(opportunities).set(row).where(eq(opportunities.id, opportunity.id)); }
  async archive(id: OpportunityId): Promise<void> { const now = new Date(); await this.db.update(opportunities).set({ status: "ARCHIVED", archivedAt: now, updatedAt: now }).where(eq(opportunities.id, id)); }
  async exists(id: OpportunityId): Promise<boolean> { const rows = await this.db.select({ id: opportunities.id }).from(opportunities).where(eq(opportunities.id, id)).limit(1); return rows.length > 0; }
}
