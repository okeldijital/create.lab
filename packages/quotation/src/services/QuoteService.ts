import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import {
  Quote,
  type CreateQuoteProps,
} from "../aggregates/Quote/Quote.js";
import { QuoteVersion } from "../aggregates/QuoteVersion/QuoteVersion.js";
import { QuoteStatus } from "../enums/QuoteStatus.js";
import {
  DuplicateQuoteNumberError,
  InvalidQuoteStateError,
  QuoteNotFoundError,
  QuoteVersionNotFoundError,
} from "../errors/QuotationErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { QuoteLifecyclePolicy } from "../policies/QuoteLifecyclePolicy.js";
import type { QuoteLineRepository } from "../repositories/QuoteLineRepository.js";
import type { QuoteRepository } from "../repositories/QuoteRepository.js";
import type { QuoteVersionRepository } from "../repositories/QuoteVersionRepository.js";
import type { QuoteId } from "../types/ids.js";
import { QuoteNumber } from "../value-objects/QuoteNumber.js";

export type QuoteServiceDeps = {
  quoteRepository: QuoteRepository;
  quoteVersionRepository: QuoteVersionRepository;
  quoteLineRepository: QuoteLineRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class QuoteService {
  constructor(private readonly deps: QuoteServiceDeps) {}

  async create(props: CreateQuoteProps): Promise<Quote> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }

    const quote = Quote.create(props);
    const existing = await this.deps.quoteRepository.findByQuoteNumber(
      props.organizationId,
      quote.quoteNumber.value,
    );
    if (existing) {
      throw new DuplicateQuoteNumberError(
        quote.quoteNumber.value,
        props.organizationId,
      );
    }

    const version = QuoteVersion.create({
      organizationId: props.organizationId,
      quoteId: quote.id,
      versionNumber: 1,
      currency: quote.currency.code,
    });
    quote.setCurrentVersion(version.id);

    await this.deps.quoteRepository.save(quote);
    await this.deps.quoteVersionRepository.save(version);
    await this.deps.eventPublisher.publish([
      ...quote.pullDomainEvents(),
      ...version.pullDomainEvents(),
    ]);
    return quote;
  }

  async issue(id: QuoteId, now?: Date): Promise<Quote> {
    const quote = await this.getById(id);
    QuoteLifecyclePolicy.assertCanIssue(quote);

    if (!quote.currentVersionId) {
      throw new InvalidQuoteStateError("Quote has no current version.");
    }
    const version = await this.deps.quoteVersionRepository.findById(
      quote.currentVersionId,
    );
    if (!version) {
      throw new QuoteVersionNotFoundError(quote.currentVersionId);
    }
    const lines = await this.deps.quoteLineRepository.findByVersion(
      version.id,
    );
    if (lines.length === 0) {
      throw new InvalidQuoteStateError("Cannot issue quote without lines.");
    }
    version.recalculateFromLines(lines, undefined, now);
    version.lock(now);
    quote.issue(now);

    await this.deps.quoteVersionRepository.update(version);
    await this.deps.quoteRepository.update(quote);
    await this.deps.eventPublisher.publish([
      ...version.pullDomainEvents(),
      ...quote.pullDomainEvents(),
    ]);
    return quote;
  }

  async accept(id: QuoteId, now?: Date): Promise<Quote> {
    const quote = await this.getById(id);
    QuoteLifecyclePolicy.assertCanAccept(quote, now);
    quote.accept(now);
    await this.deps.quoteRepository.update(quote);
    await this.deps.eventPublisher.publish(quote.pullDomainEvents());
    return quote;
  }

  async decline(id: QuoteId, now?: Date): Promise<Quote> {
    const quote = await this.getById(id);
    QuoteLifecyclePolicy.assertCanDecline(quote);
    quote.decline(now);
    await this.deps.quoteRepository.update(quote);
    await this.deps.eventPublisher.publish(quote.pullDomainEvents());
    return quote;
  }

  async expire(id: QuoteId, now?: Date): Promise<Quote> {
    const quote = await this.getById(id);
    QuoteLifecyclePolicy.assertCanExpire(quote);
    quote.expire(now);
    await this.deps.quoteRepository.update(quote);
    await this.deps.eventPublisher.publish(quote.pullDomainEvents());
    return quote;
  }

  async archive(id: QuoteId, now?: Date): Promise<Quote> {
    const quote = await this.getById(id);
    QuoteLifecyclePolicy.assertCanTransition(quote, QuoteStatus.ARCHIVED);
    quote.archive(now);
    await this.deps.quoteRepository.archive(id);
    await this.deps.quoteRepository.update(quote);
    await this.deps.eventPublisher.publish(quote.pullDomainEvents());
    return quote;
  }

  async getById(id: QuoteId): Promise<Quote> {
    const quote = await this.deps.quoteRepository.findById(id);
    if (!quote) throw new QuoteNotFoundError(id);
    return quote;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Quote[]> {
    return this.deps.quoteRepository.findByOrganization(organizationId);
  }

  async findByQuoteNumber(
    organizationId: OrganizationId,
    quoteNumber: string,
  ): Promise<Quote | null> {
    return this.deps.quoteRepository.findByQuoteNumber(
      organizationId,
      QuoteNumber.create(quoteNumber).value,
    );
  }
}
