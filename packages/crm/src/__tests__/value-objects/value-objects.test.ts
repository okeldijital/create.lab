import { describe, expect, it } from "vitest";
import { CRMValidationError } from "../../errors/CRMErrors.js";
import { BillingAddress } from "../../value-objects/BillingAddress.js";
import { CustomerName } from "../../value-objects/CustomerName.js";
import { CustomerNumber } from "../../value-objects/CustomerNumber.js";
import { EmailAddress } from "../../value-objects/EmailAddress.js";
import { InteractionSummary } from "../../value-objects/InteractionSummary.js";
import { LegalName } from "../../value-objects/LegalName.js";
import { OpportunityValue } from "../../value-objects/OpportunityValue.js";
import { PhoneNumber } from "../../value-objects/PhoneNumber.js";
import { Probability } from "../../value-objects/Probability.js";

describe("CustomerNumber", () => {
  it("validates and generates", () => {
    expect(() => CustomerNumber.create("")).toThrow(CRMValidationError);
    expect(CustomerNumber.create(" C-1 ").value).toBe("C-1");
    expect(CustomerNumber.generate().value.startsWith("CUST-")).toBe(true);
  });
  it("equality", () => {
    expect(
      CustomerNumber.create("A").equals(CustomerNumber.create("A")),
    ).toBe(true);
  });
});

describe("CustomerName / LegalName", () => {
  it("requires customer name", () => {
    expect(() => CustomerName.create("")).toThrow(CRMValidationError);
    expect(CustomerName.create(" Acme ").value).toBe("Acme");
  });
  it("legal name optional", () => {
    expect(LegalName.create(null).isEmpty).toBe(true);
    expect(LegalName.create("Acme LLC").value).toBe("Acme LLC");
  });
});

describe("EmailAddress / PhoneNumber", () => {
  it("normalizes email", () => {
    expect(EmailAddress.create("  A@B.COM ").value).toBe("a@b.com");
    expect(() => EmailAddress.create("bad")).toThrow(CRMValidationError);
  });
  it("phone optional", () => {
    expect(PhoneNumber.create(undefined).value).toBeNull();
    expect(PhoneNumber.create("+1 555").value).toBe("+1 555");
  });
  it("email equality", () => {
    expect(
      EmailAddress.create("a@b.com").equals(EmailAddress.create("A@B.COM")),
    ).toBe(true);
  });
});

describe("OpportunityValue / Probability", () => {
  it("value non-negative integer", () => {
    expect(OpportunityValue.fromMinorUnits(100).minorUnits).toBe(100);
    expect(() => OpportunityValue.fromMinorUnits(-1)).toThrow(
      CRMValidationError,
    );
    expect(() => OpportunityValue.fromMinorUnits(1.5)).toThrow(
      CRMValidationError,
    );
    expect(OpportunityValue.zero().isZero).toBe(true);
  });
  it("probability 0–100", () => {
    expect(Probability.create(50).value).toBe(50);
    expect(() => Probability.create(-1)).toThrow(CRMValidationError);
    expect(() => Probability.create(101)).toThrow(CRMValidationError);
  });
});

describe("InteractionSummary / BillingAddress", () => {
  it("summary required", () => {
    expect(() => InteractionSummary.create("")).toThrow(CRMValidationError);
    expect(InteractionSummary.create("Met client").value).toBe("Met client");
  });
  it("billing address optional and equality", () => {
    expect(BillingAddress.create(null).value).toBeNull();
    expect(
      BillingAddress.create("1 Main").equals(BillingAddress.create("1 Main")),
    ).toBe(true);
  });
  it("rejects NaN opportunity value", () => {
    expect(() => OpportunityValue.fromMinorUnits(Number.NaN)).toThrow(
      CRMValidationError,
    );
  });
  it("customer number max length", () => {
    expect(() => CustomerNumber.create("x".repeat(65))).toThrow(
      CRMValidationError,
    );
  });
});
