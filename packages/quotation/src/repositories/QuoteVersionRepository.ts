import type { QuoteVersion } from "../aggregates/QuoteVersion/QuoteVersion.js";
import type { QuoteId, QuoteVersionId } from "../types/ids.js";

export interface QuoteVersionRepository {
  findById(id: QuoteVersionId): Promise<QuoteVersion | null>;
  findByQuote(quoteId: QuoteId): Promise<QuoteVersion[]>;
  findCurrentVersion(quoteId: QuoteId): Promise<QuoteVersion | null>;
  save(version: QuoteVersion): Promise<void>;
  update(version: QuoteVersion): Promise<void>;
  exists(id: QuoteVersionId): Promise<boolean>;
}
