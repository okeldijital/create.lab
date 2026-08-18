import type { QuoteLine, QuoteLineId, QuoteLineRepository, QuoteVersionId } from "@creative-lab/quotation";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { quoteLines } from "./schema.js";
import { QuoteLineMapper } from "./mappers.js";

export class PostgresQuoteLineRepository implements QuoteLineRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: QuoteLineId): Promise<QuoteLine | null> {
    const rows = await this.db.select().from(quoteLines).where(eq(quoteLines.id, id)).limit(1);
    return rows[0] ? QuoteLineMapper.fromRow(rows[0]) : null;
  }

  async findByVersion(versionId: QuoteVersionId): Promise<QuoteLine[]> {
    const rows = await this.db.select().from(quoteLines).where(eq(quoteLines.quoteVersionId, versionId));
    return rows.map(QuoteLineMapper.fromRow);
  }

  async save(line: QuoteLine): Promise<void> {
    await this.db.insert(quoteLines).values(QuoteLineMapper.toRow(line));
  }

  async update(line: QuoteLine): Promise<void> {
    await this.db.update(quoteLines).set(QuoteLineMapper.toRow(line)).where(eq(quoteLines.id, line.id));
  }

  async delete(id: QuoteLineId): Promise<void> {
    await this.db.delete(quoteLines).where(eq(quoteLines.id, id));
  }

  async exists(id: QuoteLineId): Promise<boolean> {
    const rows = await this.db.select({ id: quoteLines.id }).from(quoteLines).where(eq(quoteLines.id, id)).limit(1);
    return rows.length > 0;
  }
}
