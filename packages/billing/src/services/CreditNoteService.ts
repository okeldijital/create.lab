import {
  CreditNote,
  type CreateCreditNoteProps,
} from "../aggregates/CreditNote/CreditNote.js";
import {
  CreditNoteNotFoundError,
  InvoiceNotFoundError,
} from "../errors/BillingErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { CreditPolicy } from "../policies/CreditPolicy.js";
import type { CreditNoteRepository } from "../repositories/CreditNoteRepository.js";
import type { InvoiceRepository } from "../repositories/InvoiceRepository.js";
import type { CreditNoteId, InvoiceId } from "../types/ids.js";
import { Money } from "../value-objects/Money.js";

export type CreditNoteServiceDeps = {
  creditNoteRepository: CreditNoteRepository;
  invoiceRepository: InvoiceRepository;
  eventPublisher: DomainEventPublisher;
};

export class CreditNoteService {
  constructor(private readonly deps: CreditNoteServiceDeps) {}

  async create(props: CreateCreditNoteProps): Promise<CreditNote> {
    const invoice = await this.deps.invoiceRepository.findById(
      props.invoiceId,
    );
    if (!invoice) throw new InvoiceNotFoundError(props.invoiceId);

    const amount = Money.fromMinorUnits(
      props.amountMinor,
      props.currency ?? invoice.currency.code,
    );
    CreditPolicy.assertWithinInvoiceTotal(invoice, amount);

    const note = CreditNote.create({
      ...props,
      currency: props.currency ?? invoice.currency.code,
    });
    await this.deps.creditNoteRepository.save(note);
    await this.deps.eventPublisher.publish(note.pullDomainEvents());
    return note;
  }

  async issue(id: CreditNoteId, now?: Date): Promise<CreditNote> {
    const note = await this.getById(id);
    note.issue(now);
    await this.deps.creditNoteRepository.update(note);
    await this.deps.eventPublisher.publish(note.pullDomainEvents());
    return note;
  }

  async apply(id: CreditNoteId, now?: Date): Promise<CreditNote> {
    const note = await this.getById(id);
    CreditPolicy.assertCanApply(note);

    const invoice = await this.deps.invoiceRepository.findById(note.invoiceId);
    if (!invoice) throw new InvoiceNotFoundError(note.invoiceId);
    CreditPolicy.assertWithinBalance(invoice, note.amount);

    note.apply(now);
    invoice.applyCredit(note.amount, now);

    await this.deps.creditNoteRepository.update(note);
    await this.deps.invoiceRepository.update(invoice);
    await this.deps.eventPublisher.publish([
      ...note.pullDomainEvents(),
      ...invoice.pullDomainEvents(),
    ]);
    return note;
  }

  async archive(id: CreditNoteId, now?: Date): Promise<CreditNote> {
    const note = await this.getById(id);
    note.archive(now);
    await this.deps.creditNoteRepository.update(note);
    await this.deps.eventPublisher.publish(note.pullDomainEvents());
    return note;
  }

  async getById(id: CreditNoteId): Promise<CreditNote> {
    const note = await this.deps.creditNoteRepository.findById(id);
    if (!note) throw new CreditNoteNotFoundError(id);
    return note;
  }

  async listByInvoice(invoiceId: InvoiceId): Promise<CreditNote[]> {
    return this.deps.creditNoteRepository.findByInvoice(invoiceId);
  }
}
