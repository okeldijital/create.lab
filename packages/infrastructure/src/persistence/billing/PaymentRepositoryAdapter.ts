import type { InvoiceId, Payment, PaymentId, PaymentRepository } from "@creative-lab/billing";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { payments } from "./schema.js";
import { PaymentMapper } from "./mappers.js";

export class PostgresPaymentRepository implements PaymentRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: PaymentId): Promise<Payment | null> {
    const rows = await this.db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return rows[0] ? PaymentMapper.fromRow(rows[0]) : null;
  }

  async findByInvoice(invoiceId: InvoiceId): Promise<Payment[]> {
    const rows = await this.db.select().from(payments).where(eq(payments.invoiceId, invoiceId));
    return rows.map(PaymentMapper.fromRow);
  }

  async save(payment: Payment): Promise<void> {
    await this.db.insert(payments).values(PaymentMapper.toRow(payment));
  }

  async update(payment: Payment): Promise<void> {
    await this.db.update(payments).set(PaymentMapper.toRow(payment)).where(eq(payments.id, payment.id));
  }
}