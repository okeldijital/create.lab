import type { Payment } from "../aggregates/Payment/Payment.js";
import type { InvoiceId, PaymentId } from "../types/ids.js";

export interface PaymentRepository {
  findById(id: PaymentId): Promise<Payment | null>;
  findByInvoice(invoiceId: InvoiceId): Promise<Payment[]>;
  save(payment: Payment): Promise<void>;
  update(payment: Payment): Promise<void>;
}
