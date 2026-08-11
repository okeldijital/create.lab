import type { Invoice } from "@creative-lab/billing";
import type { InvoiceDto } from "../dto/common.js";

export class InvoiceMapper {
  static toDto(invoice: Invoice): InvoiceDto {
    return {
      id: invoice.id,
      organizationId: invoice.organizationId,
      invoiceNumber: invoice.invoiceNumber.value,
      customerId: invoice.customerId,
      status: invoice.status,
      currency:
        typeof invoice.currency === "string"
          ? invoice.currency
          : invoice.currency.code,
      projectId: invoice.projectId,
    };
  }
}
