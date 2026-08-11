import type { ServiceId } from "@creative-lab/services";
import {
  QuoteLine,
  type CreateQuoteLineProps,
} from "../aggregates/QuoteLine/QuoteLine.js";
import {
  QuoteLineNotFoundError,
  QuoteNotFoundError,
  QuoteVersionNotFoundError,
  QuotationValidationError,
} from "../errors/QuotationErrors.js";
import { QuoteLineRemoved } from "../events/quotation-events.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { QuoteLifecyclePolicy } from "../policies/QuoteLifecyclePolicy.js";
import { VersionPolicy } from "../policies/VersionPolicy.js";
import type { QuoteLineRepository } from "../repositories/QuoteLineRepository.js";
import type { QuoteRepository } from "../repositories/QuoteRepository.js";
import type { QuoteVersionRepository } from "../repositories/QuoteVersionRepository.js";
import type { QuoteLineId, QuoteVersionId } from "../types/ids.js";

export type LineServiceDeps = {
  quoteLineRepository: QuoteLineRepository;
  quoteVersionRepository: QuoteVersionRepository;
  quoteRepository: QuoteRepository;
  eventPublisher: DomainEventPublisher;
};

export type AddLineProps = {
  organizationId: CreateQuoteLineProps["organizationId"];
  quoteVersionId: QuoteVersionId;
  serviceId: ServiceId;
  description: string;
  quantity: number;
  unitPriceMinor: number;
  now?: Date;
};

export class LineService {
  constructor(private readonly deps: LineServiceDeps) {}

  async add(props: AddLineProps): Promise<QuoteLine> {
    const version = await this.deps.quoteVersionRepository.findById(
      props.quoteVersionId,
    );
    if (!version) {
      throw new QuoteVersionNotFoundError(props.quoteVersionId);
    }
    const quote = await this.deps.quoteRepository.findById(version.quoteId);
    if (!quote) throw new QuoteNotFoundError(version.quoteId);
    QuoteLifecyclePolicy.assertDraft(quote);
    VersionPolicy.assertEditable(version, quote.isDraft);

    if (!props.serviceId) {
      throw new QuotationValidationError("serviceId is required.");
    }

    const line = QuoteLine.create({
      organizationId: props.organizationId,
      quoteVersionId: props.quoteVersionId,
      serviceId: props.serviceId,
      description: props.description,
      quantity: props.quantity,
      unitPriceMinor: props.unitPriceMinor,
      currency: quote.currency.code,
      now: props.now,
    });

    version.addLineId(line.id, props.now);
    const lines = [
      ...(await this.deps.quoteLineRepository.findByVersion(version.id)),
      line,
    ];
    version.recalculateFromLines(lines, undefined, props.now);

    await this.deps.quoteLineRepository.save(line);
    await this.deps.quoteVersionRepository.update(version);
    await this.deps.eventPublisher.publish([
      ...line.pullDomainEvents(),
      ...version.pullDomainEvents(),
    ]);
    return line;
  }

  async remove(lineId: QuoteLineId, now?: Date): Promise<void> {
    const line = await this.deps.quoteLineRepository.findById(lineId);
    if (!line) throw new QuoteLineNotFoundError(lineId);
    const version = await this.deps.quoteVersionRepository.findById(
      line.quoteVersionId,
    );
    if (!version) {
      throw new QuoteVersionNotFoundError(line.quoteVersionId);
    }
    const quote = await this.deps.quoteRepository.findById(version.quoteId);
    if (!quote) throw new QuoteNotFoundError(version.quoteId);
    QuoteLifecyclePolicy.assertDraft(quote);
    VersionPolicy.assertEditable(version, quote.isDraft);

    version.removeLineId(lineId, now);
    await this.deps.quoteLineRepository.delete(lineId);
    const remaining = await this.deps.quoteLineRepository.findByVersion(
      version.id,
    );
    version.recalculateFromLines(remaining, undefined, now);

    const removedEvent = QuoteLineRemoved.create({
      organizationId: line.organizationId,
      lineId,
      versionId: version.id,
      occurredAt: now,
    });
    await this.deps.quoteVersionRepository.update(version);
    await this.deps.eventPublisher.publish([
      removedEvent,
      ...version.pullDomainEvents(),
    ]);
  }

  async updateQuantity(
    lineId: QuoteLineId,
    quantity: number,
    unitPriceMinor: number,
    now?: Date,
  ): Promise<QuoteLine> {
    const old = await this.deps.quoteLineRepository.findById(lineId);
    if (!old) throw new QuoteLineNotFoundError(lineId);
    const version = await this.deps.quoteVersionRepository.findById(
      old.quoteVersionId,
    );
    if (!version) {
      throw new QuoteVersionNotFoundError(old.quoteVersionId);
    }
    const quote = await this.deps.quoteRepository.findById(version.quoteId);
    if (!quote) throw new QuoteNotFoundError(version.quoteId);
    QuoteLifecyclePolicy.assertDraft(quote);
    VersionPolicy.assertEditable(version, quote.isDraft);

    // Lines are immutable value-like after create; replace via delete+create
    // but keep same service/description for simplicity we recreate with same id not supported —
    // domain model: remove and re-add is handled by recreate without id.
    await this.deps.quoteLineRepository.delete(lineId);
    version.removeLineId(lineId, now);

    const line = QuoteLine.create({
      organizationId: old.organizationId,
      quoteVersionId: old.quoteVersionId,
      serviceId: old.serviceId,
      description: old.description.value,
      quantity,
      unitPriceMinor,
      currency: quote.currency.code,
      now,
    });
    version.addLineId(line.id, now);
    const lines = await this.deps.quoteLineRepository.findByVersion(
      version.id,
    );
    const all = [...lines, line];
    version.recalculateFromLines(all, undefined, now);

    await this.deps.quoteLineRepository.save(line);
    await this.deps.quoteVersionRepository.update(version);
    await this.deps.eventPublisher.publish([
      ...line.pullDomainEvents(),
      ...version.pullDomainEvents(),
    ]);
    return line;
  }

  async listByVersion(versionId: QuoteVersionId): Promise<QuoteLine[]> {
    return this.deps.quoteLineRepository.findByVersion(versionId);
  }
}
