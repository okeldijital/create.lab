import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  DuplicateMilestoneError,
  DuplicateProductionError,
  DuplicateRevisionError,
  InvalidProductionStateError,
  InvalidSessionError,
  MilestoneNotFoundError,
  MilestoneSequenceError,
  ProductionNotFoundError,
  ProductionValidationError,
  RevisionLifecycleError,
  RevisionNotFoundError,
  SessionAlreadyOpenError,
  SessionNotFoundError,
  SessionNotOpenError,
} from "../../errors/ProductionErrors.js";

describe("Error model", () => {
  it("extends DomainError with codes", () => {
    const cases: DomainError[] = [
      new ProductionNotFoundError("x"),
      new DuplicateProductionError("d"),
      new InvalidProductionStateError("s"),
      new SessionAlreadyOpenError("p"),
      new SessionNotOpenError("n"),
      new InvalidSessionError("i"),
      new MilestoneSequenceError("m"),
      new DuplicateMilestoneError("dm"),
      new RevisionLifecycleError("r"),
      new DuplicateRevisionError("dr"),
      new SessionNotFoundError("sn"),
      new MilestoneNotFoundError("mn"),
      new RevisionNotFoundError("rn"),
      new ProductionValidationError("v"),
    ];
    for (const err of cases) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBeTruthy();
    }
  });
});
