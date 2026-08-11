import { describe, expect, it } from "vitest";
import { BillingValidationError } from "../../errors/BillingErrors.js";
import { BillingReason } from "../../value-objects/BillingReason.js";
import { CreditReference } from "../../value-objects/CreditReference.js";
import { Currency } from "../../value-objects/Currency.js";
import { InvoiceDescription } from "../../value-objects/InvoiceDescription.js";
import { InvoiceNumber } from "../../value-objects/InvoiceNumber.js";
import { Money } from "../../value-objects/Money.js";
import { PaymentReference } from "../../value-objects/PaymentReference.js";

describe("Currency", () => {
  it("accepts ISO 4217 codes", () => {
    expect(Currency.create("usd").code).toBe("USD");
    expect(Currency.USD().code).toBe("USD");
  });

  it("rejects invalid codes", () => {
    expect(() => Currency.create("US")).toThrow(BillingValidationError);
    expect(() => Currency.create("")).toThrow(BillingValidationError);
  });

  it("equality", () => {
    expect(Currency.create("USD").equals(Currency.create("USD"))).toBe(true);
  });
});

describe("Money", () => {
  it("creates from minor units and major", () => {
    const m = Money.fromMinorUnits(1050, "USD");
    expect(m.minorUnits).toBe(1050);
    expect(m.major).toBe(10.5);
    expect(Money.fromMajor(10.5, "USD").minorUnits).toBe(1050);
  });

  it("rejects NaN and non-integers", () => {
    expect(() => Money.fromMinorUnits(Number.NaN, "USD")).toThrow(
      BillingValidationError,
    );
    expect(() => Money.fromMinorUnits(1.5, "USD")).toThrow(
      BillingValidationError,
    );
    expect(() => Money.fromMajor(Number.NaN, "USD")).toThrow(
      BillingValidationError,
    );
  });

  it("supports arithmetic and equality", () => {
    const a = Money.fromMinorUnits(100, "USD");
    const b = Money.fromMinorUnits(50, "USD");
    expect(a.add(b).minorUnits).toBe(150);
    expect(a.subtract(b).minorUnits).toBe(50);
    expect(a.multiply(2).minorUnits).toBe(200);
    expect(a.equals(Money.fromMinorUnits(100, "USD"))).toBe(true);
    expect(a.greaterThan(b)).toBe(true);
  });

  it("rejects currency mismatch and negative assert", () => {
    const usd = Money.fromMinorUnits(100, "USD");
    const eur = Money.fromMinorUnits(100, "EUR");
    expect(() => usd.add(eur)).toThrow(BillingValidationError);
    expect(() =>
      Money.fromMinorUnits(-1, "USD").assertNonNegative(),
    ).toThrow(BillingValidationError);
  });

  it("is immutable (equals independent instances)", () => {
    const a = Money.zero("USD");
    const b = a.add(Money.fromMinorUnits(10, "USD"));
    expect(a.minorUnits).toBe(0);
    expect(b.minorUnits).toBe(10);
    expect(a.isZero).toBe(true);
    expect(b.isPositive).toBe(true);
  });
});

describe("InvoiceNumber", () => {
  it("validates and generates", () => {
    expect(() => InvoiceNumber.create("")).toThrow(BillingValidationError);
    expect(() => InvoiceNumber.create("x".repeat(65))).toThrow(
      BillingValidationError,
    );
    expect(InvoiceNumber.create("INV-1").value).toBe("INV-1");
    expect(InvoiceNumber.generate().value.startsWith("INV-")).toBe(true);
  });

  it("equality", () => {
    expect(
      InvoiceNumber.create("A").equals(InvoiceNumber.create("A")),
    ).toBe(true);
  });
});

describe("PaymentReference / CreditReference", () => {
  it("validates payment reference", () => {
    expect(() => PaymentReference.create("")).toThrow(BillingValidationError);
    expect(PaymentReference.create(" PAY-1 ").value).toBe("PAY-1");
    expect(
      PaymentReference.create("A").equals(PaymentReference.create("A")),
    ).toBe(true);
  });

  it("validates and generates credit reference", () => {
    expect(() => CreditReference.create("")).toThrow(BillingValidationError);
    expect(CreditReference.generate().value.startsWith("CN-")).toBe(true);
  });
});

describe("InvoiceDescription / BillingReason", () => {
  it("validates description", () => {
    expect(() => InvoiceDescription.create("")).toThrow(BillingValidationError);
    expect(InvoiceDescription.create(" Line ").value).toBe("Line");
    expect(() => InvoiceDescription.create("x".repeat(501))).toThrow(
      BillingValidationError,
    );
  });

  it("validates reason", () => {
    expect(() => BillingReason.create("")).toThrow(BillingValidationError);
    expect(BillingReason.create("Discount").value).toBe("Discount");
  });
});
