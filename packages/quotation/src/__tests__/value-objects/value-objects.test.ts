import { describe, expect, it } from "vitest";
import { QuotationValidationError } from "../../errors/QuotationErrors.js";
import { Currency } from "../../value-objects/Currency.js";
import { Discount } from "../../value-objects/Discount.js";
import { Money } from "../../value-objects/Money.js";
import { Quantity } from "../../value-objects/Quantity.js";
import { QuoteDescription } from "../../value-objects/QuoteDescription.js";
import { QuoteNotes } from "../../value-objects/QuoteNotes.js";
import { QuoteNumber } from "../../value-objects/QuoteNumber.js";
import { ValidityPeriod } from "../../value-objects/ValidityPeriod.js";

describe("QuoteNumber", () => {
  it("validates and generates", () => {
    expect(() => QuoteNumber.create("")).toThrow(QuotationValidationError);
    expect(QuoteNumber.create(" Q-1 ").value).toBe("Q-1");
    expect(QuoteNumber.generate().value.startsWith("QTE-")).toBe(true);
  });
  it("equality", () => {
    expect(QuoteNumber.create("A").equals(QuoteNumber.create("A"))).toBe(true);
  });
});

describe("Quantity / Money / Discount", () => {
  it("quantity > 0", () => {
    expect(Quantity.create(2.5).value).toBe(2.5);
    expect(() => Quantity.create(0)).toThrow(QuotationValidationError);
    expect(() => Quantity.create(-1)).toThrow(QuotationValidationError);
  });
  it("money non-negative", () => {
    expect(Money.fromMinorUnits(100, "USD").minorUnits).toBe(100);
    expect(() => Money.fromMinorUnits(-1, "USD")).toThrow(
      QuotationValidationError,
    );
    expect(Money.fromMinorUnits(50, "USD").multiply(2).minorUnits).toBe(100);
  });
  it("discount and subtract", () => {
    const d = Discount.fromMinorUnits(25, "USD");
    expect(d.toMoney().minorUnits).toBe(25);
    expect(
      Money.fromMinorUnits(100, "USD").subtract(d.toMoney()).minorUnits,
    ).toBe(75);
    expect(() => Discount.fromMinorUnits(-1, "USD")).toThrow(
      QuotationValidationError,
    );
  });
  it("money equality", () => {
    expect(
      Money.fromMinorUnits(10, "USD").equals(Money.fromMinorUnits(10, "USD")),
    ).toBe(true);
  });
});

describe("Currency / Validity / Notes", () => {
  it("currency ISO", () => {
    expect(Currency.create("eur").code).toBe("EUR");
    expect(() => Currency.create("EU")).toThrow(QuotationValidationError);
  });
  it("validity expiry", () => {
    const past = ValidityPeriod.create(new Date("2020-01-01"));
    expect(past.isExpired(new Date("2021-01-01"))).toBe(true);
    expect(ValidityPeriod.create(null).isExpired()).toBe(false);
  });
  it("notes and description", () => {
    expect(QuoteNotes.create(null).value).toBeNull();
    expect(QuoteDescription.create("Line").value).toBe("Line");
    expect(() => QuoteDescription.create("")).toThrow(QuotationValidationError);
  });
  it("quote number max length", () => {
    expect(() => QuoteNumber.create("x".repeat(65))).toThrow(
      QuotationValidationError,
    );
  });
  it("discount zero helper", () => {
    expect(Discount.zero("USD").minorUnits).toBe(0);
  });
  it("money add", () => {
    expect(
      Money.fromMinorUnits(10, "USD")
        .add(Money.fromMinorUnits(5, "USD"))
        .minorUnits,
    ).toBe(15);
  });
  it("validity equality", () => {
    const a = ValidityPeriod.create(new Date("2026-01-01T00:00:00.000Z"));
    const b = ValidityPeriod.create(new Date("2026-01-01T00:00:00.000Z"));
    expect(a.equals(b)).toBe(true);
  });
  it("quantity equality", () => {
    expect(Quantity.create(1).equals(Quantity.create(1))).toBe(true);
  });
});
