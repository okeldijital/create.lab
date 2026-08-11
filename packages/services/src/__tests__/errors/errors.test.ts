import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  CategoryInUseError,
  CategoryNotFoundError,
  DuplicateCategoryNameError,
  DuplicatePriceRuleError,
  DuplicateServiceCodeError,
  InvalidPriceRangeError,
  InvalidServiceStateError,
  PriceBookNotFoundError,
  PriceRuleNotFoundError,
  PublishedPriceBookExistsError,
  ServiceNotFoundError,
  ServicesValidationError,
} from "../../errors/ServicesErrors.js";

describe("Services domain errors", () => {
  it("all extend DomainError", () => {
    const cases: DomainError[] = [
      new ServiceNotFoundError("x"),
      new DuplicateServiceCodeError("c", "o"),
      new CategoryNotFoundError("x"),
      new CategoryInUseError("c"),
      new DuplicateCategoryNameError("n", "o"),
      new PriceBookNotFoundError("x"),
      new PublishedPriceBookExistsError("USD", "o"),
      new PriceRuleNotFoundError("x"),
      new InvalidPriceRangeError("bad"),
      new DuplicatePriceRuleError("s", "p"),
      new InvalidServiceStateError("bad"),
      new ServicesValidationError("val"),
    ];
    for (const err of cases) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBeTruthy();
    }
  });

  it("specific codes", () => {
    expect(new ServiceNotFoundError("a").code).toBe("SERVICE_NOT_FOUND");
    expect(new CategoryInUseError("c").code).toBe("CATEGORY_IN_USE");
    expect(new PublishedPriceBookExistsError("USD", "o").code).toBe(
      "PUBLISHED_PRICE_BOOK_EXISTS",
    );
    expect(new InvalidPriceRangeError("m").code).toBe("INVALID_PRICE_RANGE");
  });

  it("duplicate service and price rule codes", () => {
    expect(new DuplicateServiceCodeError("X", "o").code).toBe(
      "DUPLICATE_SERVICE_CODE",
    );
    expect(new DuplicatePriceRuleError("s", "p").code).toBe(
      "DUPLICATE_PRICE_RULE",
    );
  });
});
