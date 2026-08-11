import type { PaymentMethod } from "../enums/PaymentMethod.js";
import {
  InvoiceNotFoundError,
  PaymentNotFoundError,
} from "../errors/BillingErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { PaymentPolicy } from "../policies/PaymentPolicy.js";
import type { InvoiceRepository } from "../repositories/InvoiceRepository.js";
import type { PaymentRepository } from "../repositories/PaymentRepository.js";
import type { InvoiceId, PaymentId } from "../types/ids.js";
import { Money } from "../value-objects/Money.js";
import {
  Payment,
  type CreatePaymentProps,
} from "../aggregates/Payment/Payment.js";

export type PaymentServiceDeps = {
  paymentRepository: PaymentRepository;
  invoiceRepository: InvoiceRepository;
  eventPublisher: DomainEventPublisher;
};

export type RecordPaymentProps = {
  organizationId: CreatePaymentProps["organizationId"];
  invoiceId: InvoiceId;
  reference: string;
  amountMinor: number;
  paymentDate?: Date;
  method?: PaymentMethod;
  /** If true (default), complete payment and apply to invoice immediately. */
  completeImmediately?: boolean;
  now?: Date;
};

export class PaymentService {
  constructor(private readonly deps: PaymentServiceDeps) {}

  async record(props: RecordPaymentProps): Promise<Payment> {
    const invoice = await this.deps.invoiceRepository.findById(
      props.invoiceId,
    );
    if (!invoice) throw new InvoiceNotFoundError(props.invoiceId);

    const amount = Money.fromMinorUnits(
      props.amountMinor,
      invoice.currency.code,
    );
    PaymentPolicy.assertWithinBalance(invoice, amount);

    const payment = Payment.create({
      organizationId: props.organizationId,
      invoiceId: props.invoiceId,
      reference: props.reference,
      amountMinor: props.amountMinor,
      currency: invoice.currency.code,
      paymentDate: props.paymentDate,
      method: props.method,
      now: props.now,
    });

    const completeImmediately = props.completeImmediately !== false;
    if (completeImmediately) {
      payment.complete(props.now);
      invoice.applyPayment(amount, props.now);
      await this.deps.invoiceRepository.update(invoice);
    }

    await this.deps.paymentRepository.save(payment);
    await this.deps.eventPublisher.publish([
      ...payment.pullDomainEvents(),
      ...invoice.pullDomainEvents(),
    ]);
    return payment;
  }

  async complete(id: PaymentId, now?: Date): Promise<Payment> {
    const payment = await this.getById(id);
    PaymentPolicy.assertCanComplete(payment);
    const invoice = await this.deps.invoiceRepository.findById(
      payment.invoiceId,
    );
    if (!invoice) throw new InvoiceNotFoundError(payment.invoiceId);

    PaymentPolicy.assertWithinBalance(invoice, payment.amount);
    payment.complete(now);
    invoice.applyPayment(payment.amount, now);

    await this.deps.paymentRepository.update(payment);
    await this.deps.invoiceRepository.update(invoice);
    await this.deps.eventPublisher.publish([
      ...payment.pullDomainEvents(),
      ...invoice.pullDomainEvents(),
    ]);
    return payment;
  }

  async refund(
    id: PaymentId,
    amountMinor: number,
    now?: Date,
  ): Promise<Payment> {
    const payment = await this.getById(id);
    PaymentPolicy.assertRefundLimit(payment, amountMinor);
    const invoice = await this.deps.invoiceRepository.findById(
      payment.invoiceId,
    );
    if (!invoice) throw new InvoiceNotFoundError(payment.invoiceId);

    payment.refund(amountMinor, now);
    invoice.reversePayment(
      Money.fromMinorUnits(amountMinor, payment.amount.currencyCode),
      now,
    );

    await this.deps.paymentRepository.update(payment);
    await this.deps.invoiceRepository.update(invoice);
    await this.deps.eventPublisher.publish([
      ...payment.pullDomainEvents(),
      ...invoice.pullDomainEvents(),
    ]);
    return payment;
  }

  async getById(id: PaymentId): Promise<Payment> {
    const payment = await this.deps.paymentRepository.findById(id);
    if (!payment) throw new PaymentNotFoundError(id);
    return payment;
  }

  async listByInvoice(invoiceId: InvoiceId): Promise<Payment[]> {
    return this.deps.paymentRepository.findByInvoice(invoiceId);
  }
}
