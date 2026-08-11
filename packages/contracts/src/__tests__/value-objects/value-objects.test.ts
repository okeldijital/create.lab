import { describe, expect, it } from "vitest";
import { ContractValidationError } from "../../errors/ContractErrors.js";
import { AmendmentReason } from "../../value-objects/AmendmentReason.js";
import { ContractNumber } from "../../value-objects/ContractNumber.js";
import { ContractTitle } from "../../value-objects/ContractTitle.js";
import { EffectivePeriod } from "../../value-objects/EffectivePeriod.js";
import { TermDescription } from "../../value-objects/TermDescription.js";
import { TermTitle } from "../../value-objects/TermTitle.js";
import { VersionNumber } from "../../value-objects/VersionNumber.js";

describe("ContractNumber / ContractTitle", () => {
  it("validates and generates number", () => {
    expect(() => ContractNumber.create("")).toThrow(ContractValidationError);
    expect(ContractNumber.create(" C-1 ").value).toBe("C-1");
    expect(ContractNumber.generate().value.startsWith("CTR-")).toBe(true);
  });
  it("equality", () => {
    expect(
      ContractNumber.create("A").equals(ContractNumber.create("A")),
    ).toBe(true);
  });
  it("title required", () => {
    expect(ContractTitle.create(" MSA ").value).toBe("MSA");
    expect(() => ContractTitle.create("")).toThrow(ContractValidationError);
  });
});

describe("TermTitle / TermDescription / AmendmentReason", () => {
  it("validates", () => {
    expect(TermTitle.create("Payment").value).toBe("Payment");
    expect(() => TermTitle.create("")).toThrow(ContractValidationError);
    expect(TermDescription.create("Pay net 30").value).toBe("Pay net 30");
    expect(AmendmentReason.create("Scope change").value).toBe("Scope change");
    expect(() => AmendmentReason.create("")).toThrow(ContractValidationError);
  });
  it("equality", () => {
    expect(TermTitle.create("A").equals(TermTitle.create("A"))).toBe(true);
  });
});

describe("EffectivePeriod / VersionNumber", () => {
  it("requires expiry after effective", () => {
    const p = EffectivePeriod.create(
      new Date("2026-01-01"),
      new Date("2027-01-01"),
    );
    expect(p.isEffective(new Date("2026-06-01"))).toBe(true);
    expect(p.isExpired(new Date("2028-01-01"))).toBe(true);
    expect(() =>
      EffectivePeriod.create(
        new Date("2026-01-01"),
        new Date("2025-01-01"),
      ),
    ).toThrow(ContractValidationError);
  });
  it("open-ended period", () => {
    const p = EffectivePeriod.create(new Date("2026-01-01"), null);
    expect(p.expiryDate).toBeNull();
    expect(p.isExpired()).toBe(false);
  });
  it("version number positive integer", () => {
    expect(VersionNumber.create(1).value).toBe(1);
    expect(() => VersionNumber.create(0)).toThrow(ContractValidationError);
    expect(VersionNumber.create(2).equals(VersionNumber.create(2))).toBe(true);
  });
  it("period equality", () => {
    const a = EffectivePeriod.create(
      new Date("2026-01-01T00:00:00.000Z"),
      new Date("2027-01-01T00:00:00.000Z"),
    );
    const b = EffectivePeriod.create(
      new Date("2026-01-01T00:00:00.000Z"),
      new Date("2027-01-01T00:00:00.000Z"),
    );
    expect(a.equals(b)).toBe(true);
  });
  it("contract number max length", () => {
    expect(() => ContractNumber.create("x".repeat(65))).toThrow(
      ContractValidationError,
    );
  });
  it("not effective before start", () => {
    const p = EffectivePeriod.create(
      new Date("2026-06-01"),
      new Date("2027-01-01"),
    );
    expect(p.isEffective(new Date("2026-01-01"))).toBe(false);
  });
  it("amendment reason equality", () => {
    expect(
      AmendmentReason.create("A").equals(AmendmentReason.create("A")),
    ).toBe(true);
  });
  it("term description equality", () => {
    expect(
      TermDescription.create("D").equals(TermDescription.create("D")),
    ).toBe(true);
  });
  it("title equality", () => {
    expect(
      ContractTitle.create("T").equals(ContractTitle.create("T")),
    ).toBe(true);
  });
});
