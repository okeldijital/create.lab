import type { CreditNote } from "../aggregates/CreditNote/CreditNote.js";
import type { CreditNoteId, InvoiceId } from "../types/ids.js";

export interface CreditNoteRepository {
  findById(id: CreditNoteId): Promise<CreditNote | null>;
  findByInvoice(invoiceId: InvoiceId): Promise<CreditNote[]>;
  save(creditNote: CreditNote): Promise<void>;
  update(creditNote: CreditNote): Promise<void>;
}
