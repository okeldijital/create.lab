import type { Invoice, InvoiceLine } from "@creative-lab/billing";
import { Invoice as InvoiceAggregate, InvoiceLine as InvoiceLineAggregate, asInvoiceId, asInvoiceLineId } from "@creative-lab/billing";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { invoices, invoiceLines } from "./schema.js";

type InvoiceRow = InferSelectModel<typeof invoices>;
type InvoiceLineRow = InferSelectModel<typeof invoiceLines>;

export class InvoiceMapper {
  static fromRow(row: InvoiceRow): Invoice {
    return InvoiceAggregate.reconstitute({
      id: asInvoiceId(row.id),
      organizationId: row.organizationId,
      projectId: row.projectId,
      deliveryId: row.deliveryId,
      invoiceNumber: row.invoiceNumber,
      customerId: row.customerId,
      issueDate: row.issueDate,
      dueDate: row.dueDate,
      currency: row.currency,
      subtotalMinor: row.subtotalMinor,
      taxMinor: row.taxMinor,
      discountMinor: row.discountMinor,
      totalMinor: row.totalMinor,
      balanceMinor: row.balanceMinor,
      paidMinor: row.paidMinor,
      creditedMinor: row.creditedMinor,
      lineIds: row.lineIds,
      status: row.status as any,
      archivedAt: row.archivedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toRow(invoice: Invoice): InferInsertModel<typeof invoices> {
    const s = invoice.toSnapshot();
    return { id: s.id, organizationId: s.organizationId, projectId: s.projectId, deliveryId: s.deliveryId, invoiceNumber: s.invoiceNumber, customerId: s.customerId, issueDate: s.issueDate, dueDate: s.dueDate, currency: s.currency, subtotalMinor: s.subtotalMinor, taxMinor: s.taxMinor, discountMinor: s.discountMinor, totalMinor: s.totalMinor, balanceMinor: s.balanceMinor, paidMinor: s.paidMinor, creditedMinor: s.creditedMinor, lineIds: s.lineIds, status: s.status, archivedAt: s.archivedAt, createdAt: s.createdAt, updatedAt: s.updatedAt };
  }
}

export class InvoiceLineMapper {
  static fromRow(row: InvoiceLineRow): InvoiceLine {
    return InvoiceLineAggregate.reconstitute({
      id: asInvoiceLineId(row.id),
      organizationId: row.organizationId,
      invoiceId: asInvoiceId(row.invoiceId),
      description: row.description,
      quantity: row.quantity,
      unitPriceMinor: row.unitPriceMinor,
      discountMinor: row.discountMinor,
      taxRate: row.taxRate,
      lineTotalMinor: row.lineTotalMinor,
      currency: row.currency,
      createdAt: row.createdAt,
    });
  }

  static toRow(line: InvoiceLine): InferInsertModel<typeof invoiceLines> {
    const s = line.toSnapshot();
    return { id: s.id, organizationId: s.organizationId, invoiceId: s.invoiceId, description: s.description, quantity: s.quantity, unitPriceMinor: s.unitPriceMinor, discountMinor: s.discountMinor, taxRate: s.taxRate, lineTotalMinor: s.lineTotalMinor, currency: s.currency, createdAt: s.createdAt };
  }
}
