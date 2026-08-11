import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  DeliverableAlreadyAcceptedError,
  DeliverableNotFoundError,
  DuplicateEngagementNumberError,
  EngagementNotFoundError,
  EngagementValidationError,
  InvalidEngagementStateError,
  MilestoneNotFoundError,
  MilestoneSequenceError,
  ObligationAlreadyFulfilledError,
  ObligationNotFoundError,
} from "../../errors/EngagementErrors.js";

describe("Engagement domain errors", () => {
  it("all extend DomainError", () => {
    const cases: DomainError[] = [
      new EngagementNotFoundError("x"),
      new DuplicateEngagementNumberError("n", "o"),
      new DeliverableNotFoundError("x"),
      new MilestoneNotFoundError("x"),
      new ObligationNotFoundError("x"),
      new InvalidEngagementStateError("m"),
      new DeliverableAlreadyAcceptedError("d"),
      new MilestoneSequenceError("m"),
      new ObligationAlreadyFulfilledError("o"),
      new EngagementValidationError("m"),
    ];
    for (const err of cases) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBeTruthy();
    }
  });

  it("specific codes", () => {
    expect(new EngagementNotFoundError("a").code).toBe("ENGAGEMENT_NOT_FOUND");
    expect(new DuplicateEngagementNumberError("n", "o").code).toBe(
      "DUPLICATE_ENGAGEMENT_NUMBER",
    );
    expect(new DeliverableAlreadyAcceptedError("d").code).toBe(
      "DELIVERABLE_ALREADY_ACCEPTED",
    );
    expect(new ObligationAlreadyFulfilledError("o").code).toBe(
      "OBLIGATION_ALREADY_FULFILLED",
    );
  });

  it("not found codes", () => {
    expect(new DeliverableNotFoundError("d").code).toBe("DELIVERABLE_NOT_FOUND");
    expect(new MilestoneNotFoundError("m").code).toBe("MILESTONE_NOT_FOUND");
    expect(new ObligationNotFoundError("o").code).toBe("OBLIGATION_NOT_FOUND");
  });

  it("validation and sequence codes", () => {
    expect(new EngagementValidationError("m").code).toBe(
      "ENGAGEMENT_VALIDATION",
    );
    expect(new MilestoneSequenceError("m").code).toBe(
      "MILESTONE_SEQUENCE_ERROR",
    );
    expect(new InvalidEngagementStateError("m").code).toBe(
      "INVALID_ENGAGEMENT_STATE",
    );
  });

  it("message non-empty", () => {
    expect(new EngagementNotFoundError("x").message.length).toBeGreaterThan(0);
    expect(new DeliverableNotFoundError("x").message.length).toBeGreaterThan(0);
  });
});
