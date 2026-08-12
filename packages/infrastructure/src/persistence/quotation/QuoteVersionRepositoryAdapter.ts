import type { QuoteId, QuoteVersion, QuoteVersionId, QuoteVersionRepository } from "@creative-lab/quotation";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { quoteVersions } from "./schema.js";
import { QuoteVersionMapper } from "./mappers.js";

export class PostgresQuoteVersionRepository implements QuoteVersionRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: QuoteVersionId): Promise<QuoteVersion | null> {
    const rows = await this.db.select().from(quoteVersions).where(eq(quoteVersions.id, id)).limit(1);
    return rows[0] ? QuoteVersionMapper.fromRow(rows[0]) : null;
  }

  async findByQuote(quoteId: QuoteId): Promise<QuoteVersion[]> {
    const rows = await this.db.select().from(quoteVersions).where(eq(quoteVersions.quoteId, quoteId));
    return rows.map(QuoteVersionMapper.fromRow);
  }

  async findCurrentVersion(quoteId: QuoteId): Promise<QuoteVersion | null> {
    const rows = await this.db
      .select()
      .from(quoteVersions)
      .where(and(eq(quoteVersions.quoteId, quoteId), eq(quoteVersions.status, "CURRENT")))
      .limit(1);
    return rows[0] ? QuoteVersionMapper.fromRow(rows[0]) : null;
  }

  async save(version: QuoteVersion): Promise<void> {
    await this.db.insert(quoteVersions).values(QuoteVersionMapper.toRow(version));
  }

  async update(version: QuoteVersion): Promise<void> {
    await this.db.update(quoteVersions).set(QuoteVersionMapper.toRow(version)).where(eq(quoteVersions.id, version.id));
  }

  async exists(id: QuoteVersionId): Promise<boolean> {
    const rows = await this.db.select({ id: quoteVersions.id }).from(quoteVersions).where(eq(quoteVersions.id, id)).limit(1);
    return rows.length > 0;
  }
}
