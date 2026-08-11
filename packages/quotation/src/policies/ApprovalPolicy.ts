import type { Quote } from "../aggregates/Quote/Quote.js";
import type { QuoteApproval } from "../aggregates/QuoteApproval/QuoteApproval.js";
import { ApprovalStatus } from "../enums/ApprovalStatus.js";
import { QuoteStatus } from "../enums/QuoteStatus.js";
import {
  QuoteAlreadyAcceptedError,
  QuoteApprovalError,
  QuoteExpiredError,
} from "../errors/QuotationErrors.js";

export class ApprovalPolicy {
  static assertPending(approval: QuoteApproval): void {
    if (approval.status !== ApprovalStatus.PENDING) {
      throw new QuoteApprovalError(
        "Approval decision is terminal and immutable.",
      );
    }
  }

  static assertCanRecordDecision(
    quote: Quote,
    existingDecided: readonly QuoteApproval[],
    now: Date = new Date(),
  ): void {
    if (quote.status === QuoteStatus.ACCEPTED) {
      throw new QuoteAlreadyAcceptedError(quote.id);
    }
    if (quote.status !== QuoteStatus.ISSUED) {
      throw new QuoteApprovalError(
        `Only ISSUED quotes can receive approval decisions (status: ${quote.status}).`,
      );
    }
    if (quote.isPastValidUntil(now)) {
      throw new QuoteExpiredError(quote.id);
    }
    const decided = existingDecided.find(
      (a) => a.status !== ApprovalStatus.PENDING,
    );
    if (decided) {
      throw new QuoteApprovalError(
        "A terminal approval decision already exists for this quote.",
      );
    }
  }
}
