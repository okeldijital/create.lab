import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  ApprovalAlreadyCompletedError,
  ApprovalNotFoundError,
  DecisionNotFoundError,
  DuplicateDecisionError,
  InvalidReviewStateError,
  ReviewAlreadyApprovedError,
  ReviewNotFoundError,
  ReviewValidationError,
  SessionAlreadyActiveError,
  SessionNotFoundError,
} from "../../errors/ReviewErrors.js";

describe("Error model", () => {
  it("extends DomainError with codes", () => {
    const cases: DomainError[] = [
      new ReviewNotFoundError("x"),
      new ApprovalNotFoundError("a"),
      new SessionNotFoundError("s"),
      new DecisionNotFoundError("d"),
      new ReviewAlreadyApprovedError("r"),
      new ApprovalAlreadyCompletedError("ap"),
      new InvalidReviewStateError("i"),
      new DuplicateDecisionError("rev", "ap"),
      new ReviewValidationError("v"),
      new SessionAlreadyActiveError("r"),
    ];
    for (const err of cases) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBeTruthy();
    }
  });
});
