import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  DuplicateEmailError,
  WorkerNotFoundError,
  ReportingHierarchyError,
} from "../../errors/index.js";

describe("Workforce errors", () => {
  it("extend shared DomainError from core", () => {
    const err = new WorkerNotFoundError("x");
    expect(err).toBeInstanceOf(DomainError);
    expect(err.code).toBe("WORKER_NOT_FOUND");
    expect(new DuplicateEmailError("a@b.com", "org").code).toBe(
      "DUPLICATE_WORKER_EMAIL",
    );
    expect(new ReportingHierarchyError("cycle").code).toBe(
      "REPORTING_HIERARCHY",
    );
  });
});
