import type { Quote } from "../aggregates/Quote/Quote.js";
import {
  QuoteStatus,
  canTransitionQuote,
} from "../enums/QuoteStatus.js";
import {
  InvalidQuoteStateError,
  QuoteAlreadyAcceptedError,
  QuoteExpiredError,
} from "../errors/QuotationErrors.js";

export class QuoteLifecyclePolicy {
  static assertCanTransition(quote: Quote, to: QuoteStatus): void {
    if (quote.isArchived) {
      throw new InvalidQuoteStateError("Archived quotes are immutable.");
    }
    if (!canTransitionQuote(quote.status, to)) {
      throw new InvalidQuoteStateError(
        `Illegal quote transition: ${quote.status} → ${to}.`,
      );
    }
  }

  static assertDraft(quote: Quote): void {
    if (!quote.isDraft) {
      throw new InvalidQuoteStateError(
        "Only DRAFT quotes can be modified structurally.",
      );
    }
  }

  static assertCanIssue(quote: Quote): void {
    QuoteLifecyclePolicy.assertCanTransition(quote, QuoteStatus.ISSUED);
  }

  static assertCanAccept(quote: Quote, now: Date = new Date()): void {
    if (quote.status === QuoteStatus.ACCEPTED) {
      throw new QuoteAlreadyAcceptedError(quote.id);
    }
    QuoteLifecyclePolicy.assertCanTransition(quote, QuoteStatus.ACCEPTED);
    if (quote.isPastValidUntil(now)) {
      throw new QuoteExpiredError(quote.id);
    }
  }

  static assertCanDecline(quote: Quote): void {
    QuoteLifecyclePolicy.assertCanTransition(quote, QuoteStatus.DECLINED);
  }

  static assertCanExpire(quote: Quote): void {
    QuoteLifecyclePolicy.assertCanTransition(quote, QuoteStatus.EXPIRED);
  }
}
