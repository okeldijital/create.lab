import { asInvoiceId, type InvoiceRepository, type PaymentRepository } from "@creative-lab/billing";
import type { PaymentDto } from "../../dto/common.js";
import { AuthorizationError, NotFoundError } from "../../errors/ApplicationErrors.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import { PaymentMapper } from "../../mappers/PaymentMapper.js";
import type { ListPaymentsQuery } from "../../queries/ListPaymentsQuery.js";
import type { ApplicationContext } from "../../types/context.js";

export type ListPaymentsHandlerDeps = {
  paymentRepository: PaymentRepository;
  invoiceRepository: InvoiceRepository;
};

export class ListPaymentsHandler implements QueryHandler<ListPaymentsQuery, PaymentDto[]> {
  readonly queryType = "ListPayments" as const;
  constructor(private readonly deps: ListPaymentsHandlerDeps) {}

  async handle(query: ListPaymentsQuery, context: ApplicationContext): Promise<PaymentDto[]> {
    const invoice = await this.deps.invoiceRepository.findById(asInvoiceId(query.invoiceId));
    if (!invoice) throw new NotFoundError("Invoice", query.invoiceId);
    if (String(invoice.organizationId) !== String(context.organizationId)) {
      throw new AuthorizationError();
    }
    const payments = await this.deps.paymentRepository.findByInvoice(asInvoiceId(query.invoiceId));
    return payments.map(PaymentMapper.toDto);
  }
}