import {
  Invoice,
  InvoiceLine,
  Payment,
  asInvoiceId,
  asInvoiceLineId,
  asPaymentId,
  type PaymentSnapshot,
} from "@creative-lab/billing";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { invoices, invoiceLines, payments } from "./schema.js";

type InvoiceRow = InferSelectModel<typeof invoices>;
type InvoiceLineRow = InferSelectModel<typeof invoiceLines>;
type PaymentRow = InferSelectModel<typeof payments>;

export const InvoiceMapper = {
  fromRow(row: InvoiceRow): Invoice {
    return Invoice.reconstitute({
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
  },
  toRow(invoice: Invoice): InferInsertModel<typeof invoices> {
    const s = invoice.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      projectId: s.projectId,
      deliveryId: s.deliveryId,
      invoiceNumber: s.invoiceNumber,
      customerId: s.customerId,
      issueDate: s.issueDate,
      dueDate: s.dueDate,
      currency: s.currency,
      subtotalMinor: s.subtotalMinor,
      taxMinor: s.taxMinor,
      discountMinor: s.discountMinor,
      totalMinor: s.totalMinor,
      balanceMinor: s.balanceMinor,
      paidMinor: s.paidMinor,
      creditedMinor: s.creditedMinor,
      lineIds: s.lineIds,
      status: s.status,
      archivedAt: s.archivedAt,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
};

export const InvoiceLineMapper = {
  fromRow(row: InvoiceLineRow): InvoiceLine {
    return InvoiceLine.reconstitute({
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
  },
  toRow(line: InvoiceLine): InferInsertModel<typeof invoiceLines> {
    const s = line.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      invoiceId: s.invoiceId,
      description: s.description,
      quantity: s.quantity,
      unitPriceMinor: s.unitPriceMinor,
      discountMinor: s.discountMinor,
      taxRate: s.taxRate,
      lineTotalMinor: s.lineTotalMinor,
      currency: s.currency,
      createdAt: s.createdAt,
    };
  },
};

export const PaymentMapper = {
  fromRow(row: PaymentRow): Payment {
    const snapshot: PaymentSnapshot = {
      id: asPaymentId(row.id),
      organizationId: row.organizationId,
      invoiceId: asInvoiceId(row.invoiceId),
      reference: row.reference,
      amountMinor: row.amountMinor,
      currency: row.currency,
      paymentDate: row.paymentDate,
      method: row.method as PaymentSnapshot["method"],
      status: row.status as PaymentSnapshot["status"],
      refundedMinor: row.refundedMinor,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Payment.reconstitute(snapshot);
  },
  toRow(payment: Payment): InferInsertModel<typeof payments> {
    const s = payment.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      invoiceId: s.invoiceId,
      reference: s.reference,
      amountMinor: s.amountMinor,
      currency: s.currency,
      paymentDate: s.paymentDate,
      method: s.method,
      status: s.status,
      refundedMinor: s.refundedMinor,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
};