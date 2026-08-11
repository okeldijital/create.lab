import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  DependencyCycleError,
  DeliverableNotFoundError,
  DuplicateDeliverableError,
  DuplicateObjectiveError,
  DuplicatePhaseError,
  DuplicateProjectError,
  InvalidProjectStateError,
  ObjectiveAlreadyCompletedError,
  PhaseSequenceError,
  ProjectDependencyNotFoundError,
  ProjectNotFoundError,
  ProjectObjectiveNotFoundError,
  ProjectPhaseNotFoundError,
  ProjectValidationError,
  SelfDependencyError,
} from "../../errors/ProjectErrors.js";

describe("Error model", () => {
  it("extends DomainError with stable codes", () => {
    const cases: DomainError[] = [
      new ProjectNotFoundError("x"),
      new DuplicateProjectError("n", "org"),
      new InvalidProjectStateError("bad"),
      new PhaseSequenceError("seq"),
      new DuplicateDeliverableError("n", "p"),
      new DependencyCycleError("cycle"),
      new SelfDependencyError("p"),
      new ObjectiveAlreadyCompletedError("n"),
      new ProjectPhaseNotFoundError("ph"),
      new DeliverableNotFoundError("d"),
      new ProjectDependencyNotFoundError("dep"),
      new ProjectObjectiveNotFoundError("o"),
      new DuplicatePhaseError("dup"),
      new DuplicateObjectiveError("n", "p"),
      new ProjectValidationError("v"),
    ];
    for (const err of cases) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBeTruthy();
    }
  });
});
