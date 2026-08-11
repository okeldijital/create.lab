import { QuoteVersion } from "../aggregates/QuoteVersion/QuoteVersion.js";
import {
  QuoteNotFoundError,
  QuoteVersionNotFoundError,
} from "../errors/QuotationErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { QuoteLifecyclePolicy } from "../policies/QuoteLifecyclePolicy.js";
import { VersionPolicy } from "../policies/VersionPolicy.js";
import type { QuoteLineRepository } from "../repositories/QuoteLineRepository.js";
import type { QuoteRepository } from "../repositories/QuoteRepository.js";
import type { QuoteVersionRepository } from "../repositories/QuoteVersionRepository.js";
import type { QuoteId, QuoteVersionId } from "../types/ids.js";

export type VersionServiceDeps = {
  quoteVersionRepository: QuoteVersionRepository;
  quoteRepository: QuoteRepository;
  quoteLineRepository: QuoteLineRepository;
  eventPublisher: DomainEventPublisher;
};

export class VersionService {
  constructor(private readonly deps: VersionServiceDeps) {}

  /**
   * Create a new draft version from current (copy line structure by recalculation empty first).
   * Supersedes previous current version and promotes the new one.
   */
  async createVersion(quoteId: QuoteId, now?: Date): Promise<QuoteVersion> {
    const quote = await this.deps.quoteRepository.findById(quoteId);
    if (!quote) throw new QuoteNotFoundError(quoteId);
    QuoteLifecyclePolicy.assertDraft(quote);

    const existing = await this.deps.quoteVersionRepository.findByQuote(
      quoteId,
    );
    const nextNumber = VersionPolicy.nextVersionNumber(existing);
    const previous = existing.find((v) => v.isCurrent) ?? null;

    const version = QuoteVersion.create({
      organizationId: quote.organizationId,
      quoteId,
      versionNumber: nextNumber,
      currency: quote.currency.code,
      now,
    });

    if (previous) {
      previous.supersede(now);
      await this.deps.quoteVersionRepository.update(previous);
    }
    version.promote(previous?.id ?? null, now);
    quote.setCurrentVersion(version.id, now);

    await this.deps.quoteVersionRepository.save(version);
    await this.deps.quoteRepository.update(quote);
    await this.deps.eventPublisher.publish([
      ...version.pullDomainEvents(),
      ...(previous?.pullDomainEvents() ?? []),
      ...quote.pullDomainEvents(),
    ]);
    return version;
  }

  async getById(id: QuoteVersionId): Promise<QuoteVersion> {
    const version = await this.deps.quoteVersionRepository.findById(id);
    if (!version) throw new QuoteVersionNotFoundError(id);
    return version;
  }

  async getCurrent(quoteId: QuoteId): Promise<QuoteVersion | null> {
    return this.deps.quoteVersionRepository.findCurrentVersion(quoteId);
  }

  async listByQuote(quoteId: QuoteId): Promise<QuoteVersion[]> {
    return this.deps.quoteVersionRepository.findByQuote(quoteId);
  }
}
