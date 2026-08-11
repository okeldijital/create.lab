import type { QuoteLine } from "../aggregates/QuoteLine/QuoteLine.js";
import type { QuoteLineId, QuoteVersionId } from "../types/ids.js";

export interface QuoteLineRepository {
  findById(id: QuoteLineId): Promise<QuoteLine | null>;
  findByVersion(versionId: QuoteVersionId): Promise<QuoteLine[]>;
  save(line: QuoteLine): Promise<void>;
  update(line: QuoteLine): Promise<void>;
  delete(id: QuoteLineId): Promise<void>;
  exists(id: QuoteLineId): Promise<boolean>;
}
