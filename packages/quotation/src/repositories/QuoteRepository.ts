import type { CustomerId } from "@creative-lab/crm";
import type { OrganizationId } from "@creative-lab/organization";
import type { Quote } from "../aggregates/Quote/Quote.js";
import type { QuoteStatus } from "../enums/QuoteStatus.js";
import type { QuoteId } from "../types/ids.js";

export interface QuoteRepository {
  findById(id: QuoteId): Promise<Quote | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Quote[]>;
  findByCustomer(customerId: CustomerId): Promise<Quote[]>;
  findByStatus(status: QuoteStatus): Promise<Quote[]>;
  findByQuoteNumber(
    organizationId: OrganizationId,
    quoteNumber: string,
  ): Promise<Quote | null>;
  save(quote: Quote): Promise<void>;
  update(quote: Quote): Promise<void>;
  archive(id: QuoteId): Promise<void>;
  exists(id: QuoteId): Promise<boolean>;
}
