import type { InvoiceId, InvoiceLine, InvoiceLineId, InvoiceLineRepository } from "@creative-lab/billing";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { invoiceLines } from "./schema.js";
import { InvoiceLineMapper } from "./mappers.js";

export class PostgresInvoiceLineRepository implements InvoiceLineRepository {
  constructor(private readonly db: DrizzleDatabase) {}
  async findById(id: InvoiceLineId) { const rows = await this.db.select().from(invoiceLines).where(eq(invoiceLines.id, id)).limit(1); return rows[0] ? InvoiceLineMapper.fromRow(rows[0]) : null; }
  async findByInvoice(id: InvoiceId) { const rows = await this.db.select().from(invoiceLines).where(eq(invoiceLines.invoiceId, id)); return rows.map(InvoiceLineMapper.fromRow); }
  async save(line: InvoiceLine) { await this.db.insert(invoiceLines).values(InvoiceLineMapper.toRow(line)); }
  async update(line: InvoiceLine) { await this.db.update(invoiceLines).set(InvoiceLineMapper.toRow(line)).where(eq(invoiceLines.id, line.id)); }
  async delete(id: InvoiceLineId) { await this.db.delete(invoiceLines).where(eq(invoiceLines.id, id)); }
}
