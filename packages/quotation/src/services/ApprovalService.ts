import {
  QuoteApproval,
  type CreateQuoteApprovalProps,
} from "../aggregates/QuoteApproval/QuoteApproval.js";
import {
  QuoteApprovalError,
  QuoteNotFoundError,
} from "../errors/QuotationErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ApprovalPolicy } from "../policies/ApprovalPolicy.js";
import { QuoteLifecyclePolicy } from "../policies/QuoteLifecyclePolicy.js";
import type { QuoteApprovalRepository } from "../repositories/QuoteApprovalRepository.js";
import type { QuoteRepository } from "../repositories/QuoteRepository.js";
import type { QuoteApprovalId, QuoteId } from "../types/ids.js";

export type ApprovalServiceDeps = {
  quoteApprovalRepository: QuoteApprovalRepository;
  quoteRepository: QuoteRepository;
  eventPublisher: DomainEventPublisher;
};

export class ApprovalService {
  constructor(private readonly deps: ApprovalServiceDeps) {}

  async createPending(
    props: CreateQuoteApprovalProps,
  ): Promise<QuoteApproval> {
    const quote = await this.deps.quoteRepository.findById(props.quoteId);
    if (!quote) throw new QuoteNotFoundError(props.quoteId);
    if (!quote.isIssued) {
      throw new QuoteApprovalError(
        "Approvals can only be opened for ISSUED quotes.",
      );
    }
    const approval = QuoteApproval.create(props);
    await this.deps.quoteApprovalRepository.save(approval);
    await this.deps.eventPublisher.publish(approval.pullDomainEvents());
    return approval;
  }

  async accept(
    quoteId: QuoteId,
    notes?: string | null,
    now?: Date,
  ): Promise<QuoteApproval> {
    const quote = await this.deps.quoteRepository.findById(quoteId);
    if (!quote) throw new QuoteNotFoundError(quoteId);
    const existing = await this.deps.quoteApprovalRepository.findByQuote(
      quoteId,
    );
    ApprovalPolicy.assertCanRecordDecision(quote, existing, now);

    const pending = existing.find((a) => a.isPending);
    const approval =
      pending ??
      QuoteApproval.create({
        organizationId: quote.organizationId,
        quoteId,
        notes,
        now,
      });
    ApprovalPolicy.assertPending(approval);
    approval.accept(now);
    QuoteLifecyclePolicy.assertCanAccept(quote, now);
    quote.accept(now);

    if (pending) {
      await this.deps.quoteApprovalRepository.update(approval);
    } else {
      await this.deps.quoteApprovalRepository.save(approval);
    }
    await this.deps.quoteRepository.update(quote);
    await this.deps.eventPublisher.publish([
      ...approval.pullDomainEvents(),
      ...quote.pullDomainEvents(),
    ]);
    return approval;
  }

  async decline(
    quoteId: QuoteId,
    notes?: string | null,
    now?: Date,
  ): Promise<QuoteApproval> {
    const quote = await this.deps.quoteRepository.findById(quoteId);
    if (!quote) throw new QuoteNotFoundError(quoteId);
    const existing = await this.deps.quoteApprovalRepository.findByQuote(
      quoteId,
    );
    ApprovalPolicy.assertCanRecordDecision(quote, existing, now);

    const pending = existing.find((a) => a.isPending);
    const approval =
      pending ??
      QuoteApproval.create({
        organizationId: quote.organizationId,
        quoteId,
        notes,
        now,
      });
    ApprovalPolicy.assertPending(approval);
    approval.decline(now);
    QuoteLifecyclePolicy.assertCanDecline(quote);
    quote.decline(now);

    if (pending) {
      await this.deps.quoteApprovalRepository.update(approval);
    } else {
      await this.deps.quoteApprovalRepository.save(approval);
    }
    await this.deps.quoteRepository.update(quote);
    await this.deps.eventPublisher.publish([
      ...approval.pullDomainEvents(),
      ...quote.pullDomainEvents(),
    ]);
    return approval;
  }

  async getById(id: QuoteApprovalId): Promise<QuoteApproval> {
    const approval = await this.deps.quoteApprovalRepository.findById(id);
    if (!approval) {
      throw new QuoteApprovalError(`Approval not found: ${id}`);
    }
    return approval;
  }

  async listByQuote(quoteId: QuoteId): Promise<QuoteApproval[]> {
    return this.deps.quoteApprovalRepository.findByQuote(quoteId);
  }
}
