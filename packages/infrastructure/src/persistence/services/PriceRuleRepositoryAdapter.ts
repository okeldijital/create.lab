import type { PriceRule, PriceBookId, PriceRuleId, PriceRuleRepository, ServiceId } from "@creative-lab/services";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { priceRules } from "./schema.js";
import { PriceRuleMapper } from "./mappers.js";

export class PostgresPriceRuleRepository implements PriceRuleRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: PriceRuleId): Promise<PriceRule | null> {
    const rows = await this.db.select().from(priceRules).where(eq(priceRules.id, id)).limit(1);
    return rows[0] ? PriceRuleMapper.fromRow(rows[0]) : null;
  }

  async findByPriceBook(priceBookId: PriceBookId): Promise<PriceRule[]> {
    const rows = await this.db.select().from(priceRules).where(eq(priceRules.priceBookId, priceBookId));
    return rows.map(PriceRuleMapper.fromRow);
  }

  async findByService(serviceId: ServiceId): Promise<PriceRule[]> {
    const rows = await this.db.select().from(priceRules).where(eq(priceRules.serviceId, serviceId));
    return rows.map(PriceRuleMapper.fromRow);
  }

  async findActiveByServiceAndBook(serviceId: ServiceId, priceBookId: PriceBookId): Promise<PriceRule | null> {
    const rows = await this.db.select().from(priceRules).where(and(eq(priceRules.serviceId, serviceId), eq(priceRules.priceBookId, priceBookId), eq(priceRules.status, "ACTIVE"))).limit(1);
    return rows[0] ? PriceRuleMapper.fromRow(rows[0]) : null;
  }

  async save(rule: PriceRule): Promise<void> {
    await this.db.insert(priceRules).values(PriceRuleMapper.toRow(rule));
  }

  async update(rule: PriceRule): Promise<void> {
    await this.db.update(priceRules).set(PriceRuleMapper.toRow(rule)).where(eq(priceRules.id, rule.id));
  }

  async archive(id: PriceRuleId): Promise<void> {
    const now = new Date();
    await this.db.update(priceRules).set({ status: "ARCHIVED", archivedAt: now, updatedAt: now }).where(eq(priceRules.id, id));
  }

  async exists(id: PriceRuleId): Promise<boolean> {
    const rows = await this.db.select({ id: priceRules.id }).from(priceRules).where(eq(priceRules.id, id)).limit(1);
    return rows.length > 0;
  }
}
