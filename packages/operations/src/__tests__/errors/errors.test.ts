import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  DuplicateMilestoneError,
  IncidentAlreadyResolvedError,
  InvalidIncidentStateError,
  InvalidWorkStateError,
  MilestoneAlreadyCompletedError,
  OperationsValidationError,
  OutputVersionConflictError,
  SessionOverlapError,
  WorkIncidentNotFoundError,
  WorkMilestoneNotFoundError,
  WorkOrderNotFoundError,
  WorkOutputNotFoundError,
  WorkSessionNotFoundError,
} from "../../errors/OperationsErrors.js";

describe("Error model", () => {
  it("extends DomainError with stable codes", () => {
    const cases: DomainError[] = [
      new WorkOrderNotFoundError("x"),
      new InvalidWorkStateError("bad"),
      new SessionOverlapError("overlap"),
      new MilestoneAlreadyCompletedError("n"),
      new DuplicateMilestoneError("n", "wo"),
      new OutputVersionConflictError("v"),
      new IncidentAlreadyResolvedError("i"),
      new InvalidIncidentStateError("bad"),
      new WorkSessionNotFoundError("s"),
      new WorkMilestoneNotFoundError("m"),
      new WorkOutputNotFoundError("o"),
      new WorkIncidentNotFoundError("i"),
      new OperationsValidationError("v"),
    ];
    for (const err of cases) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBeTruthy();
      expect(err.message).toBeTruthy();
    }
  });
});
