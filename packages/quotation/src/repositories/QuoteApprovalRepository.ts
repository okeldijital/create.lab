import type { QuoteApproval } from "../aggregates/QuoteApproval/QuoteApproval.js";
import type { QuoteApprovalId, QuoteId } from "../types/ids.js";

export interface QuoteApprovalRepository {
  findById(id: QuoteApprovalId): Promise<QuoteApproval | null>;
  findByQuote(quoteId: QuoteId): Promise<QuoteApproval[]>;
  save(approval: QuoteApproval): Promise<void>;
  update(approval: QuoteApproval): Promise<void>;
  exists(id: QuoteApprovalId): Promise<boolean>;
}
