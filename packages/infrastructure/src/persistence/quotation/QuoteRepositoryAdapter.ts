import type { CustomerId } from "@creative-lab/crm";
import type { OrganizationId } from "@creative-lab/organization";
import type { Quote, QuoteId, QuoteRepository, QuoteStatus } from "@creative-lab/quotation";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { quotes } from "./schema.js";
import { QuoteMapper } from "./mappers.js";

export class PostgresQuoteRepository implements QuoteRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: QuoteId): Promise<Quote | null> {
    const rows = await this.db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
    return rows[0] ? QuoteMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<Quote[]> {
    const rows = await this.db.select().from(quotes).where(eq(quotes.organizationId, organizationId));
    return rows.map(QuoteMapper.fromRow);
  }

  async findByCustomer(customerId: CustomerId): Promise<Quote[]> {
    const rows = await this.db.select().from(quotes).where(eq(quotes.customerId, customerId));
    return rows.map(QuoteMapper.fromRow);
  }

  async findByStatus(status: QuoteStatus): Promise<Quote[]> {
    const rows = await this.db.select().from(quotes).where(eq(quotes.status, status));
    return rows.map(QuoteMapper.fromRow);
  }

  async findByQuoteNumber(organizationId: OrganizationId, quoteNumber: string): Promise<Quote | null> {
    const rows = await this.db.select().from(quotes).where(and(eq(quotes.organizationId, organizationId), eq(quotes.quoteNumber, quoteNumber))).limit(1);
    return rows[0] ? QuoteMapper.fromRow(rows[0]) : null;
  }

  async save(quote: Quote): Promise<void> {
    await this.db.insert(quotes).values(QuoteMapper.toRow(quote));
  }

  async update(quote: Quote): Promise<void> {
    await this.db.update(quotes).set(QuoteMapper.toRow(quote)).where(eq(quotes.id, quote.id));
  }

  async archive(id: QuoteId): Promise<void> {
    const now = new Date();
    await this.db.update(quotes).set({ status: "ARCHIVED", archivedAt: now, updatedAt: now }).where(eq(quotes.id, id));
  }

  async exists(id: QuoteId): Promise<boolean> {
    const rows = await this.db.select({ id: quotes.id }).from(quotes).where(eq(quotes.id, id)).limit(1);
    return rows.length > 0;
  }
}
