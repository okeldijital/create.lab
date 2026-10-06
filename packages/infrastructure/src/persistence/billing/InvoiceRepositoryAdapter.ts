import type { DeliveryId } from "@creative-lab/delivery";
import type { Invoice, InvoiceId, InvoiceRepository } from "@creative-lab/billing";
import type { CustomerId } from "@creative-lab/crm";
import type { OrganizationId } from "@creative-lab/organization";
import type { ProjectId } from "@creative-lab/projects";
import { and, eq, ne } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { invoices } from "./schema.js";
import { InvoiceMapper } from "./mappers.js";

export class PostgresInvoiceRepository implements InvoiceRepository {
  constructor(private readonly db: DrizzleDatabase) {}
  async findById(id: InvoiceId) { const rows = await this.db.select().from(invoices).where(eq(invoices.id, id)).limit(1); return rows[0] ? InvoiceMapper.fromRow(rows[0]) : null; }
  async findByOrganization(id: OrganizationId) { const rows = await this.db.select().from(invoices).where(eq(invoices.organizationId, id)); return rows.map(InvoiceMapper.fromRow); }
  async findByProject(id: ProjectId) { const rows = await this.db.select().from(invoices).where(eq(invoices.projectId, id)); return rows.map(InvoiceMapper.fromRow); }
  async findByDelivery(id: DeliveryId) { const rows = await this.db.select().from(invoices).where(eq(invoices.deliveryId, id)); return rows.map(InvoiceMapper.fromRow); }
  async findByCustomer(id: CustomerId) { const rows = await this.db.select().from(invoices).where(eq(invoices.customerId, id)); return rows.map(InvoiceMapper.fromRow); }
  async findByInvoiceNumber(number: string) { const rows = await this.db.select().from(invoices).where(eq(invoices.invoiceNumber, number)).limit(1); return rows[0] ? InvoiceMapper.fromRow(rows[0]) : null; }
  async findOutstanding() { const rows = await this.db.select().from(invoices).where(and(ne(invoices.status, "PAID"), ne(invoices.status, "VOID"), ne(invoices.status, "ARCHIVED"))); return rows.map(InvoiceMapper.fromRow); }
  async findPaid() { const rows = await this.db.select().from(invoices).where(eq(invoices.status, "PAID")); return rows.map(InvoiceMapper.fromRow); }
  async save(invoice: Invoice) { await this.db.insert(invoices).values(InvoiceMapper.toRow(invoice)); }
  async update(invoice: Invoice) { await this.db.update(invoices).set(InvoiceMapper.toRow(invoice)).where(eq(invoices.id, invoice.id)); }
  async archive(id: InvoiceId) { const now = new Date(); await this.db.update(invoices).set({ status: "ARCHIVED", archivedAt: now, updatedAt: now }).where(eq(invoices.id, id)); }
  async exists(id: InvoiceId) { const rows = await this.db.select({ id: invoices.id }).from(invoices).where(eq(invoices.id, id)).limit(1); return rows.length > 0; }
}
