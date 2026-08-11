import type { Invoice } from "../aggregates/Invoice/Invoice.js";
import {
  InvoiceStatus,
  canTransitionInvoice,
} from "../enums/InvoiceStatus.js";
import {
  InvalidInvoiceStateError,
  InvoiceAlreadyPaidError,
} from "../errors/BillingErrors.js";

export class InvoiceLifecyclePolicy {
  static assertCanTransition(invoice: Invoice, to: InvoiceStatus): void {
    if (invoice.isArchived) {
      throw new InvalidInvoiceStateError(
        "Archived invoices are immutable.",
      );
    }
    if (!canTransitionInvoice(invoice.status, to)) {
      throw new InvalidInvoiceStateError(
        `Illegal invoice transition: ${invoice.status} → ${to}.`,
      );
    }
  }

  static assertDraft(invoice: Invoice): void {
    if (!invoice.isDraft) {
      throw new InvalidInvoiceStateError(
        "Only DRAFT invoices can be modified structurally.",
      );
    }
  }

  static assertCanVoid(invoice: Invoice): void {
    if (invoice.isPaid) {
      throw new InvoiceAlreadyPaidError(invoice.id);
    }
    InvoiceLifecyclePolicy.assertCanTransition(invoice, InvoiceStatus.VOID);
  }
}
