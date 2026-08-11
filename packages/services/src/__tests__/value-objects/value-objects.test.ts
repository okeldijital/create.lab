import { describe, expect, it } from "vitest";
import {
  InvalidPriceRangeError,
  ServicesValidationError,
} from "../../errors/ServicesErrors.js";
import { CategoryName } from "../../value-objects/CategoryName.js";
import { Currency } from "../../value-objects/Currency.js";
import { Money } from "../../value-objects/Money.js";
import { PriceBookName } from "../../value-objects/PriceBookName.js";
import { PriceRange } from "../../value-objects/PriceRange.js";
import { ServiceCode } from "../../value-objects/ServiceCode.js";
import { ServiceDescription } from "../../value-objects/ServiceDescription.js";
import { ServiceName } from "../../value-objects/ServiceName.js";

describe("ServiceCode / ServiceName", () => {
  it("normalizes and validates code", () => {
    expect(ServiceCode.create("  film-mix ").value).toBe("FILM-MIX");
    expect(() => ServiceCode.create("")).toThrow(ServicesValidationError);
    expect(() => ServiceCode.create("bad code")).toThrow(
      ServicesValidationError,
    );
  });
  it("service name required and equality", () => {
    expect(ServiceName.create(" Mix ").value).toBe("Mix");
    expect(ServiceName.create("A").equals(ServiceName.create("A"))).toBe(true);
    expect(() => ServiceName.create("")).toThrow(ServicesValidationError);
  });
});

describe("CategoryName / PriceBookName / Description", () => {
  it("validates names", () => {
    expect(CategoryName.create("Audio").value).toBe("Audio");
    expect(() => CategoryName.create("")).toThrow(ServicesValidationError);
    expect(PriceBookName.create("2026 USD").value).toBe("2026 USD");
  });
  it("description optional", () => {
    expect(ServiceDescription.create(null).value).toBeNull();
    expect(ServiceDescription.create("desc").value).toBe("desc");
  });
});

describe("Currency / Money", () => {
  it("currency ISO", () => {
    expect(Currency.create("usd").code).toBe("USD");
    expect(() => Currency.create("US")).toThrow(ServicesValidationError);
  });
  it("money non-negative integer", () => {
    expect(Money.fromMinorUnits(100, "USD").minorUnits).toBe(100);
    expect(() => Money.fromMinorUnits(-1, "USD")).toThrow(
      ServicesValidationError,
    );
    expect(() => Money.fromMinorUnits(Number.NaN, "USD")).toThrow(
      ServicesValidationError,
    );
    expect(Money.zero("USD").isZero).toBe(true);
  });
  it("money equality and compare", () => {
    const a = Money.fromMinorUnits(50, "USD");
    const b = Money.fromMinorUnits(100, "USD");
    expect(a.equals(Money.fromMinorUnits(50, "USD"))).toBe(true);
    expect(b.greaterThan(a)).toBe(true);
  });
});

describe("PriceRange", () => {
  it("enforces min ≤ base ≤ max", () => {
    const r = PriceRange.create({
      baseMinor: 1000,
      minimumMinor: 500,
      maximumMinor: 2000,
      currency: "USD",
    });
    expect(r.base.minorUnits).toBe(1000);
    expect(r.minimum.minorUnits).toBe(500);
    expect(r.maximum.minorUnits).toBe(2000);
  });
  it("rejects invalid ranges", () => {
    expect(() =>
      PriceRange.create({
        baseMinor: 100,
        minimumMinor: 200,
        maximumMinor: 300,
        currency: "USD",
      }),
    ).toThrow(InvalidPriceRangeError);
    expect(() =>
      PriceRange.create({
        baseMinor: 400,
        minimumMinor: 100,
        maximumMinor: 300,
        currency: "USD",
      }),
    ).toThrow(InvalidPriceRangeError);
  });
  it("equality", () => {
    const a = PriceRange.create({
      baseMinor: 10,
      minimumMinor: 10,
      maximumMinor: 10,
      currency: "USD",
    });
    const b = PriceRange.create({
      baseMinor: 10,
      minimumMinor: 10,
      maximumMinor: 10,
      currency: "USD",
    });
    expect(a.equals(b)).toBe(true);
  });

  it("service code max length", () => {
    expect(() => ServiceCode.create("X".repeat(65))).toThrow(
      ServicesValidationError,
    );
  });

  it("currency USD helper", () => {
    expect(Currency.USD().code).toBe("USD");
  });

  it("money currency mismatch compare", () => {
    const a = Money.fromMinorUnits(1, "USD");
    const b = Money.fromMinorUnits(1, "EUR");
    expect(() => a.greaterThan(b)).toThrow(ServicesValidationError);
  });
});
