import { describe, expect, it } from "vitest";
import { PortfolioValidationError } from "../../errors/PortfolioErrors.js";
import { InitiativeTitle } from "../../value-objects/InitiativeTitle.js";
import { MilestoneTitle } from "../../value-objects/MilestoneTitle.js";
import { PortfolioDescription } from "../../value-objects/PortfolioDescription.js";
import { PortfolioName } from "../../value-objects/PortfolioName.js";
import { PortfolioNumber } from "../../value-objects/PortfolioNumber.js";
import { ProgramName } from "../../value-objects/ProgramName.js";
import { SequenceNumber } from "../../value-objects/SequenceNumber.js";

describe("PortfolioNumber / PortfolioName", () => {
  it("validates and generates number", () => {
    expect(() => PortfolioNumber.create("")).toThrow(PortfolioValidationError);
    expect(PortfolioNumber.create(" P-1 ").value).toBe("P-1");
    expect(PortfolioNumber.generate().value.startsWith("PFO-")).toBe(true);
  });
  it("equality", () => {
    expect(
      PortfolioNumber.create("A").equals(PortfolioNumber.create("A")),
    ).toBe(true);
  });
  it("name required", () => {
    expect(PortfolioName.create(" Growth ").value).toBe("Growth");
    expect(() => PortfolioName.create("")).toThrow(PortfolioValidationError);
  });
  it("max length number", () => {
    expect(() => PortfolioNumber.create("x".repeat(65))).toThrow(
      PortfolioValidationError,
    );
  });
});

describe("ProgramName / InitiativeTitle / MilestoneTitle", () => {
  it("validates", () => {
    expect(ProgramName.create("Alpha").value).toBe("Alpha");
    expect(InitiativeTitle.create("Grow APAC").value).toBe("Grow APAC");
    expect(MilestoneTitle.create("Board review").value).toBe("Board review");
    expect(() => ProgramName.create("")).toThrow(PortfolioValidationError);
    expect(() => InitiativeTitle.create("")).toThrow(PortfolioValidationError);
  });
  it("equality", () => {
    expect(ProgramName.create("A").equals(ProgramName.create("A"))).toBe(true);
    expect(
      InitiativeTitle.create("T").equals(InitiativeTitle.create("T")),
    ).toBe(true);
    expect(MilestoneTitle.create("M").equals(MilestoneTitle.create("M"))).toBe(
      true,
    );
  });
});

describe("Description / Sequence", () => {
  it("description optional", () => {
    expect(PortfolioDescription.create(null).value).toBeNull();
    expect(PortfolioDescription.create("D").value).toBe("D");
  });
  it("sequence positive", () => {
    expect(SequenceNumber.create(1).value).toBe(1);
    expect(() => SequenceNumber.create(0)).toThrow(PortfolioValidationError);
    expect(SequenceNumber.create(2).equals(SequenceNumber.create(2))).toBe(
      true,
    );
  });
  it("name equality", () => {
    expect(
      PortfolioName.create("N").equals(PortfolioName.create("N")),
    ).toBe(true);
  });
  it("description equality", () => {
    expect(
      PortfolioDescription.create("D").equals(
        PortfolioDescription.create("D"),
      ),
    ).toBe(true);
  });
  it("high sequence", () => {
    expect(SequenceNumber.create(99).value).toBe(99);
  });
  it("milestone title max basic", () => {
    expect(MilestoneTitle.create("Gate").value).toBe("Gate");
  });
});
