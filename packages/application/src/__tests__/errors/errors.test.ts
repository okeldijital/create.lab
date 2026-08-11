import { describe, expect, it } from "vitest";
import {
  ApplicationError,
  AuthorizationError,
  ConflictError,
  ConcurrencyError,
  HandlerNotFoundError,
  NotFoundError,
  TransactionError,
  ValidationError,
} from "../../errors/ApplicationErrors.js";

describe("Application errors", () => {
  it("all extend ApplicationError with codes", () => {
    const errors = [
      new ValidationError("v", [{ field: "x", message: "required" }]),
      new AuthorizationError(),
      new NotFoundError("Org", "1"),
      new ConflictError("dup"),
      new ConcurrencyError(),
      new TransactionError("tx"),
      new HandlerNotFoundError("X"),
    ];
    for (const e of errors) {
      expect(e).toBeInstanceOf(ApplicationError);
      expect(e.code).toBeTruthy();
      expect(e.message.length).toBeGreaterThan(0);
    }
  });

  it("ValidationError carries field errors", () => {
    const e = new ValidationError("fail", [
      { field: "name", message: "required" },
    ]);
    expect(e.fieldErrors).toHaveLength(1);
    expect(e.code).toBe("APPLICATION_VALIDATION");
  });

  it("NotFoundError formats message", () => {
    expect(new NotFoundError("Project", "p1").message).toContain("p1");
    expect(new NotFoundError("Project").message).toBe("Project not found");
  });

  it("HandlerNotFoundError includes type", () => {
    const e = new HandlerNotFoundError("CreateX");
    expect(e.details?.type).toBe("CreateX");
  });

  it("AuthorizationError default message", () => {
    expect(new AuthorizationError().code).toBe("APPLICATION_AUTHORIZATION");
  });

  it("ConcurrencyError and ConflictError codes", () => {
    expect(new ConcurrencyError().code).toBe("APPLICATION_CONCURRENCY");
    expect(new ConflictError("c").code).toBe("APPLICATION_CONFLICT");
  });
});
