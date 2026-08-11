import type { AnyDomainEvent } from "@creative-lab/core";
import type { CustomerId } from "@creative-lab/crm";
import type {
  Organization,
  OrganizationId,
  OrganizationRepository,
  OrganizationSlug,
} from "@creative-lab/organization";
import type { Quote } from "../../aggregates/Quote/Quote.js";
import type { QuoteApproval } from "../../aggregates/QuoteApproval/QuoteApproval.js";
import type { QuoteLine } from "../../aggregates/QuoteLine/QuoteLine.js";
import type { QuoteVersion } from "../../aggregates/QuoteVersion/QuoteVersion.js";
import type { QuoteStatus } from "../../enums/QuoteStatus.js";
import { QuoteVersionStatus } from "../../enums/QuoteVersionStatus.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { QuoteApprovalRepository } from "../../repositories/QuoteApprovalRepository.js";
import type { QuoteLineRepository } from "../../repositories/QuoteLineRepository.js";
import type { QuoteRepository } from "../../repositories/QuoteRepository.js";
import type { QuoteVersionRepository } from "../../repositories/QuoteVersionRepository.js";
import type {
  QuoteApprovalId,
  QuoteId,
  QuoteLineId,
  QuoteVersionId,
} from "../../types/ids.js";

export class InMemoryEventPublisher implements DomainEventPublisher {
  readonly events: AnyDomainEvent[] = [];
  async publish(events: readonly AnyDomainEvent[]): Promise<void> {
    this.events.push(...events);
  }
}

export class InMemoryOrganizationRepository implements OrganizationRepository {
  private readonly byId = new Map<string, Organization>();
  async findById(id: OrganizationId): Promise<Organization | null> {
    return this.byId.get(id) ?? null;
  }
  async findBySlug(
    slug: OrganizationSlug | string,
  ): Promise<Organization | null> {
    const v = typeof slug === "string" ? slug : slug.value;
    for (const o of this.byId.values()) {
      if (o.slug.value === v) return o;
    }
    return null;
  }
  async findAll(): Promise<Organization[]> {
    return [...this.byId.values()];
  }
  async save(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async update(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async archive(id: OrganizationId): Promise<void> {
    void id;
  }
  async exists(id: OrganizationId): Promise<boolean> {
    return this.byId.has(id);
  }
  async existsBySlug(slug: OrganizationSlug | string): Promise<boolean> {
    return (await this.findBySlug(slug)) !== null;
  }
  async delete(id: OrganizationId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryQuoteRepository implements QuoteRepository {
  private readonly byId = new Map<string, Quote>();
  async findById(id: QuoteId): Promise<Quote | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Quote[]> {
    return [...this.byId.values()].filter(
      (q) => q.organizationId === organizationId,
    );
  }
  async findByCustomer(customerId: CustomerId): Promise<Quote[]> {
    return [...this.byId.values()].filter((q) => q.customerId === customerId);
  }
  async findByStatus(status: QuoteStatus): Promise<Quote[]> {
    return [...this.byId.values()].filter((q) => q.status === status);
  }
  async findByQuoteNumber(
    organizationId: OrganizationId,
    quoteNumber: string,
  ): Promise<Quote | null> {
    return (
      [...this.byId.values()].find(
        (q) =>
          q.organizationId === organizationId &&
          q.quoteNumber.value === quoteNumber,
      ) ?? null
    );
  }
  async save(quote: Quote): Promise<void> {
    this.byId.set(quote.id, quote);
  }
  async update(quote: Quote): Promise<void> {
    this.byId.set(quote.id, quote);
  }
  async archive(id: QuoteId): Promise<void> {
    void id;
  }
  async exists(id: QuoteId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryQuoteVersionRepository
  implements QuoteVersionRepository
{
  private readonly byId = new Map<string, QuoteVersion>();
  async findById(id: QuoteVersionId): Promise<QuoteVersion | null> {
    return this.byId.get(id) ?? null;
  }
  async findByQuote(quoteId: QuoteId): Promise<QuoteVersion[]> {
    return [...this.byId.values()].filter((v) => v.quoteId === quoteId);
  }
  async findCurrentVersion(quoteId: QuoteId): Promise<QuoteVersion | null> {
    return (
      [...this.byId.values()].find(
        (v) =>
          v.quoteId === quoteId &&
          v.status === QuoteVersionStatus.CURRENT,
      ) ?? null
    );
  }
  async save(version: QuoteVersion): Promise<void> {
    this.byId.set(version.id, version);
  }
  async update(version: QuoteVersion): Promise<void> {
    this.byId.set(version.id, version);
  }
  async exists(id: QuoteVersionId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryQuoteLineRepository implements QuoteLineRepository {
  private readonly byId = new Map<string, QuoteLine>();
  async findById(id: QuoteLineId): Promise<QuoteLine | null> {
    return this.byId.get(id) ?? null;
  }
  async findByVersion(versionId: QuoteVersionId): Promise<QuoteLine[]> {
    return [...this.byId.values()].filter(
      (l) => l.quoteVersionId === versionId,
    );
  }
  async save(line: QuoteLine): Promise<void> {
    this.byId.set(line.id, line);
  }
  async update(line: QuoteLine): Promise<void> {
    this.byId.set(line.id, line);
  }
  async delete(id: QuoteLineId): Promise<void> {
    this.byId.delete(id);
  }
  async exists(id: QuoteLineId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryQuoteApprovalRepository
  implements QuoteApprovalRepository
{
  private readonly byId = new Map<string, QuoteApproval>();
  async findById(id: QuoteApprovalId): Promise<QuoteApproval | null> {
    return this.byId.get(id) ?? null;
  }
  async findByQuote(quoteId: QuoteId): Promise<QuoteApproval[]> {
    return [...this.byId.values()].filter((a) => a.quoteId === quoteId);
  }
  async save(approval: QuoteApproval): Promise<void> {
    this.byId.set(approval.id, approval);
  }
  async update(approval: QuoteApproval): Promise<void> {
    this.byId.set(approval.id, approval);
  }
  async exists(id: QuoteApprovalId): Promise<boolean> {
    return this.byId.has(id);
  }
}
