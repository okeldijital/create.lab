import type { QuoteApproval, QuoteApprovalId, QuoteApprovalRepository, QuoteId } from "@creative-lab/quotation";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { quoteApprovals } from "./schema.js";
import { QuoteApprovalMapper } from "./mappers.js";

export class PostgresQuoteApprovalRepository implements QuoteApprovalRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: QuoteApprovalId): Promise<QuoteApproval | null> {
    const rows = await this.db.select().from(quoteApprovals).where(eq(quoteApprovals.id, id)).limit(1);
    return rows[0] ? QuoteApprovalMapper.fromRow(rows[0]) : null;
  }

  async findByQuote(quoteId: QuoteId): Promise<QuoteApproval[]> {
    const rows = await this.db.select().from(quoteApprovals).where(eq(quoteApprovals.quoteId, quoteId));
    return rows.map(QuoteApprovalMapper.fromRow);
  }

  async save(approval: QuoteApproval): Promise<void> {
    await this.db.insert(quoteApprovals).values(QuoteApprovalMapper.toRow(approval));
  }

  async update(approval: QuoteApproval): Promise<void> {
    await this.db.update(quoteApprovals).set(QuoteApprovalMapper.toRow(approval)).where(eq(quoteApprovals.id, approval.id));
  }

  async exists(id: QuoteApprovalId): Promise<boolean> {
    const rows = await this.db.select({ id: quoteApprovals.id }).from(quoteApprovals).where(eq(quoteApprovals.id, id)).limit(1);
    return rows.length > 0;
  }
}
