import type { InvoiceLine } from "../aggregates/InvoiceLine/InvoiceLine.js";
import type { InvoiceId, InvoiceLineId } from "../types/ids.js";

export interface InvoiceLineRepository {
  findById(id: InvoiceLineId): Promise<InvoiceLine | null>;
  findByInvoice(invoiceId: InvoiceId): Promise<InvoiceLine[]>;
  save(line: InvoiceLine): Promise<void>;
  update(line: InvoiceLine): Promise<void>;
  delete(id: InvoiceLineId): Promise<void>;
}
