import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  DuplicateQuoteNumberError,
  InvalidQuoteStateError,
  QuotationValidationError,
  QuoteAlreadyAcceptedError,
  QuoteAlreadyIssuedError,
  QuoteApprovalError,
  QuoteExpiredError,
  QuoteLineNotFoundError,
  QuoteNotFoundError,
  QuoteVersionNotFoundError,
} from "../../errors/QuotationErrors.js";

describe("Quotation domain errors", () => {
  it("all extend DomainError", () => {
    const cases: DomainError[] = [
      new QuoteNotFoundError("x"),
      new DuplicateQuoteNumberError("n", "o"),
      new QuoteVersionNotFoundError("x"),
      new QuoteAlreadyIssuedError("x"),
      new QuoteAlreadyAcceptedError("x"),
      new QuoteExpiredError("x"),
      new QuoteApprovalError("m"),
      new QuoteLineNotFoundError("x"),
      new InvalidQuoteStateError("m"),
      new QuotationValidationError("m"),
    ];
    for (const err of cases) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBeTruthy();
    }
  });

  it("specific codes", () => {
    expect(new QuoteNotFoundError("a").code).toBe("QUOTE_NOT_FOUND");
    expect(new QuoteExpiredError("a").code).toBe("QUOTE_EXPIRED");
    expect(new QuotationValidationError("m").code).toBe(
      "QUOTATION_VALIDATION",
    );
  });

  it("duplicate and already codes", () => {
    expect(new DuplicateQuoteNumberError("n", "o").code).toBe(
      "DUPLICATE_QUOTE_NUMBER",
    );
    expect(new QuoteAlreadyAcceptedError("x").code).toBe(
      "QUOTE_ALREADY_ACCEPTED",
    );
    expect(new QuoteAlreadyIssuedError("x").code).toBe("QUOTE_ALREADY_ISSUED");
  });

  it("version and line not found codes", () => {
    expect(new QuoteVersionNotFoundError("v").code).toBe(
      "QUOTE_VERSION_NOT_FOUND",
    );
    expect(new QuoteLineNotFoundError("l").code).toBe("QUOTE_LINE_NOT_FOUND");
  });
});
