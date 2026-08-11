import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  AllocationConflictError,
  AllocationGroupNotFoundError,
  AllocationNotFoundError,
  AllocationValidationError,
  DuplicateAllocationError,
  DuplicateAllocationGroupError,
  InvalidAllocationPercentageError,
  InvalidAllocationStateError,
  ReservationLifecycleError,
  ReservationNotFoundError,
} from "../../errors/AllocationErrors.js";

describe("Error model", () => {
  it("extends DomainError with codes", () => {
    const cases: DomainError[] = [
      new AllocationNotFoundError("x"),
      new DuplicateAllocationError("d"),
      new InvalidAllocationStateError("s"),
      new AllocationConflictError("c"),
      new InvalidAllocationPercentageError("p"),
      new ReservationNotFoundError("r"),
      new ReservationLifecycleError("l"),
      new AllocationGroupNotFoundError("g"),
      new DuplicateAllocationGroupError("n", "org"),
      new AllocationValidationError("v"),
    ];
    for (const err of cases) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBeTruthy();
    }
  });
});
