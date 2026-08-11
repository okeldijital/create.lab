import { describe, expect, it } from "vitest";
import { ReviewValidationError } from "../../errors/ReviewErrors.js";
import { ApprovalCount } from "../../value-objects/ApprovalCount.js";
import { ApprovalRequirement } from "../../value-objects/ApprovalRequirement.js";
import { DecisionNotes } from "../../value-objects/DecisionNotes.js";
import { ReviewDescription } from "../../value-objects/ReviewDescription.js";
import { ReviewTitle } from "../../value-objects/ReviewTitle.js";
import { ReviewerReference } from "../../value-objects/ReviewerReference.js";

describe("Value objects", () => {
  it("ReviewTitle required", () => {
    expect(() => ReviewTitle.create("")).toThrow(ReviewValidationError);
    expect(ReviewTitle.create("  Mix  ").value).toBe("Mix");
  });

  it("ReviewDescription optional", () => {
    expect(ReviewDescription.create(null).value).toBeNull();
  });

  it("ApprovalRequirement ≥1", () => {
    expect(ApprovalRequirement.create(3).value).toBe(3);
    expect(() => ApprovalRequirement.create(0)).toThrow(ReviewValidationError);
  });

  it("ApprovalCount increment and meets", () => {
    const c = ApprovalCount.zero().increment();
    expect(c.value).toBe(1);
    expect(c.meets(1)).toBe(true);
    expect(c.meets(2)).toBe(false);
  });

  it("DecisionNotes optional", () => {
    expect(DecisionNotes.create(undefined).value).toBeNull();
    expect(DecisionNotes.create("ok").value).toBe("ok");
  });

  it("ReviewerReference required", () => {
    expect(() => ReviewerReference.create("")).toThrow(ReviewValidationError);
    expect(ReviewerReference.create("u1").value).toBe("u1");
  });

  it("value equality", () => {
    expect(
      ReviewTitle.create("A").equals(ReviewTitle.create("A")),
    ).toBe(true);
  });

  it("ApprovalCount rejects negative", () => {
    expect(() => ApprovalCount.create(-1)).toThrow(ReviewValidationError);
  });

  it("ReviewDescription max length", () => {
    expect(() => ReviewDescription.create("x".repeat(5001))).toThrow(
      ReviewValidationError,
    );
  });
});
