import type { PriceBook } from "../aggregates/PriceBook/PriceBook.js";
import type { PriceRule } from "../aggregates/PriceRule/PriceRule.js";
import type { Service } from "../aggregates/Service/Service.js";
import { PricingModel } from "../enums/PricingModel.js";
import {
  DuplicatePriceRuleError,
  InvalidPriceRangeError,
  InvalidServiceStateError,
} from "../errors/ServicesErrors.js";
import { PriceRange } from "../value-objects/PriceRange.js";

export class PriceRulePolicy {
  static assertValidRange(input: {
    basePriceMinor: number;
    minimumPriceMinor?: number;
    maximumPriceMinor?: number;
    currency: string;
  }): PriceRange {
    const min = input.minimumPriceMinor ?? input.basePriceMinor;
    const max = input.maximumPriceMinor ?? input.basePriceMinor;
    try {
      return PriceRange.create({
        baseMinor: input.basePriceMinor,
        minimumMinor: min,
        maximumMinor: max,
        currency: input.currency,
      });
    } catch (e) {
      if (e instanceof InvalidPriceRangeError) throw e;
      throw e;
    }
  }

  static assertNoDuplicate(
    serviceId: string,
    priceBookId: string,
    existing: readonly PriceRule[],
    excludeRuleId?: string,
  ): void {
    const dup = existing.find(
      (r) =>
        r.isActive &&
        r.serviceId === serviceId &&
        r.priceBookId === priceBookId &&
        r.id !== excludeRuleId,
    );
    if (dup) {
      throw new DuplicatePriceRuleError(serviceId, priceBookId);
    }
  }

  static assertCurrencyMatchesBook(
    book: PriceBook,
    currency: string,
  ): void {
    if (book.currency.code !== currency.toUpperCase()) {
      throw new InvalidServiceStateError(
        `Price rule currency ${currency} must match price book ${book.currency.code}.`,
      );
    }
  }

  static assertPricingModelCompatible(
    service: Service,
    _range: PriceRange,
  ): void {
    // CUSTOM allows free-form; FIXED/HOURLY/DAILY/PER_UNIT all use ranges.
    if (!Object.values(PricingModel).includes(service.pricingModel)) {
      throw new InvalidServiceStateError(
        `Unsupported pricing model: ${service.pricingModel}`,
      );
    }
  }

  static assertMutable(rule: PriceRule): void {
    if (rule.isArchived) {
      throw new InvalidServiceStateError(
        "Archived price rules are immutable.",
      );
    }
  }
}
