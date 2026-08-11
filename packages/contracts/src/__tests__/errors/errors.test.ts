import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  ContractAlreadyActiveError,
  ContractAmendmentError,
  ContractAmendmentNotFoundError,
  ContractExpiredError,
  ContractNotFoundError,
  ContractTermError,
  ContractTermNotFoundError,
  ContractValidationError,
  ContractVersionNotFoundError,
  DuplicateContractNumberError,
  InvalidContractStateError,
  MandatoryTermRemovalError,
} from "../../errors/ContractErrors.js";

describe("Contract domain errors", () => {
  it("all extend DomainError", () => {
    const cases: DomainError[] = [
      new ContractNotFoundError("x"),
      new DuplicateContractNumberError("n", "o"),
      new ContractVersionNotFoundError("x"),
      new ContractAlreadyActiveError("x"),
      new ContractExpiredError("x"),
      new ContractTermError("m"),
      new MandatoryTermRemovalError("t"),
      new ContractAmendmentError("m"),
      new InvalidContractStateError("m"),
      new ContractValidationError("m"),
      new ContractTermNotFoundError("x"),
      new ContractAmendmentNotFoundError("x"),
    ];
    for (const err of cases) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBeTruthy();
    }
  });

  it("specific codes", () => {
    expect(new ContractNotFoundError("a").code).toBe("CONTRACT_NOT_FOUND");
    expect(new MandatoryTermRemovalError("t").code).toBe(
      "MANDATORY_TERM_REMOVAL",
    );
    expect(new DuplicateContractNumberError("n", "o").code).toBe(
      "DUPLICATE_CONTRACT_NUMBER",
    );
  });

  it("active and expired codes", () => {
    expect(new ContractAlreadyActiveError("x").code).toBe(
      "CONTRACT_ALREADY_ACTIVE",
    );
    expect(new ContractExpiredError("x").code).toBe("CONTRACT_EXPIRED");
  });

  it("term and amendment not found", () => {
    expect(new ContractTermNotFoundError("t").code).toBe(
      "CONTRACT_TERM_NOT_FOUND",
    );
    expect(new ContractAmendmentNotFoundError("a").code).toBe(
      "CONTRACT_AMENDMENT_NOT_FOUND",
    );
    expect(new ContractVersionNotFoundError("v").code).toBe(
      "CONTRACT_VERSION_NOT_FOUND",
    );
  });
});
