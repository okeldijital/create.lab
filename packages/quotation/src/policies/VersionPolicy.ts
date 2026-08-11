import type { QuoteVersion } from "../aggregates/QuoteVersion/QuoteVersion.js";
import { QuoteVersionStatus } from "../enums/QuoteVersionStatus.js";
import { InvalidQuoteStateError } from "../errors/QuotationErrors.js";

export class VersionPolicy {
  static assertEditable(version: QuoteVersion, quoteIsDraft: boolean): void {
    if (!quoteIsDraft) {
      throw new InvalidQuoteStateError(
        "Versions are immutable after the quote is issued.",
      );
    }
    if (version.status === QuoteVersionStatus.SUPERSEDED) {
      throw new InvalidQuoteStateError(
        "Superseded versions cannot be edited.",
      );
    }
  }

  static assertSequential(
    nextNumber: number,
    existing: readonly QuoteVersion[],
  ): void {
    const max = existing.reduce(
      (m, v) => Math.max(m, v.versionNumber),
      0,
    );
    if (nextNumber !== max + 1) {
      throw new InvalidQuoteStateError(
        `Version numbers must be sequential (expected ${max + 1}, got ${nextNumber}).`,
      );
    }
  }

  static nextVersionNumber(existing: readonly QuoteVersion[]): number {
    const max = existing.reduce(
      (m, v) => Math.max(m, v.versionNumber),
      0,
    );
    return max + 1;
  }

  static assertOneCurrent(versions: readonly QuoteVersion[]): void {
    const currents = versions.filter(
      (v) => v.status === QuoteVersionStatus.CURRENT,
    );
    if (currents.length > 1) {
      throw new InvalidQuoteStateError(
        "Exactly one current version is allowed.",
      );
    }
  }
}
