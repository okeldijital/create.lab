import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  DuplicateInitiativeTitleError,
  DuplicatePortfolioNumberError,
  InitiativeNotFoundError,
  InvalidPortfolioStateError,
  PortfolioMilestoneNotFoundError,
  PortfolioNotFoundError,
  PortfolioValidationError,
  ProgramNotFoundError,
  ProgramSequenceError,
} from "../../errors/PortfolioErrors.js";

describe("Portfolio domain errors", () => {
  it("all extend DomainError", () => {
    const cases: DomainError[] = [
      new PortfolioNotFoundError("x"),
      new DuplicatePortfolioNumberError("n", "o"),
      new ProgramNotFoundError("x"),
      new InitiativeNotFoundError("x"),
      new PortfolioMilestoneNotFoundError("x"),
      new InvalidPortfolioStateError("m"),
      new DuplicateInitiativeTitleError("t", "p"),
      new ProgramSequenceError("m"),
      new PortfolioValidationError("m"),
    ];
    for (const err of cases) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBeTruthy();
    }
  });

  it("specific codes", () => {
    expect(new PortfolioNotFoundError("a").code).toBe("PORTFOLIO_NOT_FOUND");
    expect(new DuplicatePortfolioNumberError("n", "o").code).toBe(
      "DUPLICATE_PORTFOLIO_NUMBER",
    );
    expect(new DuplicateInitiativeTitleError("t", "p").code).toBe(
      "DUPLICATE_INITIATIVE_TITLE",
    );
    expect(new ProgramSequenceError("m").code).toBe("PROGRAM_SEQUENCE_ERROR");
  });

  it("not found codes", () => {
    expect(new ProgramNotFoundError("p").code).toBe("PROGRAM_NOT_FOUND");
    expect(new InitiativeNotFoundError("i").code).toBe("INITIATIVE_NOT_FOUND");
    expect(new PortfolioMilestoneNotFoundError("m").code).toBe(
      "PORTFOLIO_MILESTONE_NOT_FOUND",
    );
  });

  it("validation and state codes", () => {
    expect(new PortfolioValidationError("m").code).toBe(
      "PORTFOLIO_VALIDATION",
    );
    expect(new InvalidPortfolioStateError("m").code).toBe(
      "INVALID_PORTFOLIO_STATE",
    );
  });

  it("messages non-empty", () => {
    expect(new PortfolioNotFoundError("x").message.length).toBeGreaterThan(0);
    expect(new ProgramNotFoundError("x").message.length).toBeGreaterThan(0);
  });

  it("initiative and milestone messages", () => {
    expect(
      new InitiativeNotFoundError("i").message.length,
    ).toBeGreaterThan(0);
    expect(
      new PortfolioMilestoneNotFoundError("m").message.length,
    ).toBeGreaterThan(0);
  });
});
