import { describe, expect, it } from "vitest";
import { EngagementValidationError } from "../../errors/EngagementErrors.js";
import { DeliverableTitle } from "../../value-objects/DeliverableTitle.js";
import { EngagementDescription } from "../../value-objects/EngagementDescription.js";
import { EngagementNumber } from "../../value-objects/EngagementNumber.js";
import { MilestoneTitle } from "../../value-objects/MilestoneTitle.js";
import { ObligationTitle } from "../../value-objects/ObligationTitle.js";
import { SequenceNumber } from "../../value-objects/SequenceNumber.js";
import { TargetDate } from "../../value-objects/TargetDate.js";

describe("EngagementNumber", () => {
  it("validates and generates", () => {
    expect(() => EngagementNumber.create("")).toThrow(EngagementValidationError);
    expect(EngagementNumber.create(" E-1 ").value).toBe("E-1");
    expect(EngagementNumber.generate().value.startsWith("ENG-")).toBe(true);
  });
  it("equality", () => {
    expect(
      EngagementNumber.create("A").equals(EngagementNumber.create("A")),
    ).toBe(true);
  });
  it("max length", () => {
    expect(() => EngagementNumber.create("x".repeat(65))).toThrow(
      EngagementValidationError,
    );
  });
});

describe("Titles and description", () => {
  it("deliverable title", () => {
    expect(DeliverableTitle.create(" Film ").value).toBe("Film");
    expect(() => DeliverableTitle.create("")).toThrow(EngagementValidationError);
    expect(
      DeliverableTitle.create("A").equals(DeliverableTitle.create("A")),
    ).toBe(true);
  });
  it("milestone and obligation titles", () => {
    expect(MilestoneTitle.create("Kickoff").value).toBe("Kickoff");
    expect(ObligationTitle.create("Pay").value).toBe("Pay");
    expect(() => MilestoneTitle.create("")).toThrow(EngagementValidationError);
  });
  it("description optional", () => {
    expect(EngagementDescription.create(null).value).toBeNull();
    expect(EngagementDescription.create("Desc").value).toBe("Desc");
  });
});

describe("SequenceNumber / TargetDate", () => {
  it("sequence positive integer", () => {
    expect(SequenceNumber.create(1).value).toBe(1);
    expect(() => SequenceNumber.create(0)).toThrow(EngagementValidationError);
    expect(SequenceNumber.create(2).equals(SequenceNumber.create(2))).toBe(
      true,
    );
  });
  it("target date compare", () => {
    const a = TargetDate.create(new Date("2026-01-01"));
    const b = TargetDate.create(new Date("2026-06-01"));
    expect(a.isBefore(b)).toBe(true);
    expect(b.isAfter(a)).toBe(true);
    expect(a.equals(TargetDate.create(new Date("2026-01-01T00:00:00.000Z")))).toBe(
      true,
    );
  });
  it("invalid target date", () => {
    expect(() => TargetDate.create(new Date("invalid"))).toThrow(
      EngagementValidationError,
    );
  });
  it("milestone title equality", () => {
    expect(
      MilestoneTitle.create("A").equals(MilestoneTitle.create("A")),
    ).toBe(true);
  });
  it("obligation title equality", () => {
    expect(
      ObligationTitle.create("O").equals(ObligationTitle.create("O")),
    ).toBe(true);
  });
  it("description equality", () => {
    expect(
      EngagementDescription.create("D").equals(
        EngagementDescription.create("D"),
      ),
    ).toBe(true);
  });
  it("sequence max basic", () => {
    expect(SequenceNumber.create(100).value).toBe(100);
  });
});
