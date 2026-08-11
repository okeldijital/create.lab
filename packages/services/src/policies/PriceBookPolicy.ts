import type { PriceBook } from "../aggregates/PriceBook/PriceBook.js";
import {
  PriceBookStatus,
  canTransitionPriceBook,
} from "../enums/PriceBookStatus.js";
import {
  InvalidServiceStateError,
  PublishedPriceBookExistsError,
} from "../errors/ServicesErrors.js";

export class PriceBookPolicy {
  static assertCanTransition(book: PriceBook, to: PriceBookStatus): void {
    if (book.isArchived) {
      throw new InvalidServiceStateError(
        "Archived price books are immutable.",
      );
    }
    if (!canTransitionPriceBook(book.status, to)) {
      throw new InvalidServiceStateError(
        `Illegal price book transition: ${book.status} → ${to}.`,
      );
    }
  }

  static assertCanPublish(
    book: PriceBook,
    publishedForCurrency: readonly PriceBook[],
  ): void {
    PriceBookPolicy.assertCanTransition(book, PriceBookStatus.PUBLISHED);
    const other = publishedForCurrency.find(
      (b) =>
        b.id !== book.id &&
        b.isPublished &&
        b.currency.code === book.currency.code,
    );
    if (other) {
      throw new PublishedPriceBookExistsError(
        book.currency.code,
        book.organizationId,
      );
    }
  }

  static assertEffectivePeriod(from: Date, to: Date | null): void {
    if (to && to.getTime() < from.getTime()) {
      throw new InvalidServiceStateError(
        "effectiveTo must be on or after effectiveFrom.",
      );
    }
  }
}
