import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  CapacityProfileNotFoundError,
  DuplicateCapabilityError,
  InvalidCapacityQuantityError,
} from "../../errors/index.js";

describe("Capacity errors", () => {
  it("extend DomainError from core", () => {
    const err = new CapacityProfileNotFoundError("x");
    expect(err).toBeInstanceOf(DomainError);
    expect(err.code).toBe("CAPACITY_PROFILE_NOT_FOUND");
    expect(new DuplicateCapabilityError("Mixing", "cp").code).toBe(
      "DUPLICATE_CAPABILITY",
    );
    expect(new InvalidCapacityQuantityError("bad").code).toBe(
      "INVALID_CAPACITY_QUANTITY",
    );
  });
});
