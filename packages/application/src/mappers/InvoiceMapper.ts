import type { Invoice } from "@creative-lab/billing";
import type { InvoiceDetailDto, InvoiceDto } from "../dto/common.js";

export class InvoiceMapper {
  static toDto(invoice: Invoice): InvoiceDto {
    return {
      id: invoice.id,
      organizationId: invoice.organizationId,
      invoiceNumber: invoice.invoiceNumber.value,
      customerId: invoice.customerId,
      status: invoice.status,
      currency: invoice.currency.code,
      projectId: invoice.projectId,
      deliveryId: invoice.deliveryId,
    };
  }

  static toDetailDto(invoice: Invoice): InvoiceDetailDto {
    return {
      ...this.toDto(invoice),
      issueDate: invoice.issueDate?.toISOString() ?? null,
      dueDate: invoice.dueDate?.toISOString() ?? null,
      subtotalMinor: invoice.subtotal.minorUnits,
      taxMinor: invoice.tax.minorUnits,
      discountMinor: invoice.discount.minorUnits,
      totalMinor: invoice.total.minorUnits,
      balanceMinor: invoice.balance.minorUnits,
      paidMinor: invoice.paid.minorUnits,
      creditedMinor: invoice.credited.minorUnits,
      lineIds: invoice.lineIds.map(String),
      archivedAt: invoice.archivedAt?.toISOString() ?? null,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    };
  }
}
