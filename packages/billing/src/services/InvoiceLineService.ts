import {
  InvoiceLine,
  type CreateInvoiceLineProps,
} from "../aggregates/InvoiceLine/InvoiceLine.js";
import {
  InvoiceLineNotFoundError,
  InvoiceNotFoundError,
} from "../errors/BillingErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { InvoiceLifecyclePolicy } from "../policies/InvoiceLifecyclePolicy.js";
import type { InvoiceLineRepository } from "../repositories/InvoiceLineRepository.js";
import type { InvoiceRepository } from "../repositories/InvoiceRepository.js";
import type { InvoiceId, InvoiceLineId } from "../types/ids.js";

export type InvoiceLineServiceDeps = {
  invoiceLineRepository: InvoiceLineRepository;
  invoiceRepository: InvoiceRepository;
  eventPublisher: DomainEventPublisher;
};

export class InvoiceLineService {
  constructor(private readonly deps: InvoiceLineServiceDeps) {}

  async add(props: CreateInvoiceLineProps): Promise<InvoiceLine> {
    const invoice = await this.deps.invoiceRepository.findById(
      props.invoiceId,
    );
    if (!invoice) throw new InvoiceNotFoundError(props.invoiceId);
    InvoiceLifecyclePolicy.assertDraft(invoice);

    const line = InvoiceLine.create({
      ...props,
      currency: props.currency ?? invoice.currency.code,
    });
    invoice.addLineId(line.id);
    const lines = [
      ...(await this.deps.invoiceLineRepository.findByInvoice(invoice.id)),
      line,
    ];
    invoice.recalculateFromLines(lines);

    await this.deps.invoiceLineRepository.save(line);
    await this.deps.invoiceRepository.update(invoice);
    await this.deps.eventPublisher.publish(invoice.pullDomainEvents());
    return line;
  }

  async remove(lineId: InvoiceLineId, now?: Date): Promise<void> {
    const line = await this.deps.invoiceLineRepository.findById(lineId);
    if (!line) throw new InvoiceLineNotFoundError(lineId);
    const invoice = await this.deps.invoiceRepository.findById(line.invoiceId);
    if (!invoice) throw new InvoiceNotFoundError(line.invoiceId);
    InvoiceLifecyclePolicy.assertDraft(invoice);

    invoice.removeLineId(lineId, now);
    await this.deps.invoiceLineRepository.delete(lineId);
    const remaining = await this.deps.invoiceLineRepository.findByInvoice(
      invoice.id,
    );
    invoice.recalculateFromLines(remaining, now);
    await this.deps.invoiceRepository.update(invoice);
    await this.deps.eventPublisher.publish(invoice.pullDomainEvents());
  }

  async listByInvoice(invoiceId: InvoiceId): Promise<InvoiceLine[]> {
    return this.deps.invoiceLineRepository.findByInvoice(invoiceId);
  }
}
