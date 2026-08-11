import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  CRMValidationError,
  ContactNotFoundError,
  CustomerNotFoundError,
  DuplicateContactEmailError,
  DuplicateCustomerNumberError,
  DuplicatePrimaryContactError,
  InteractionNotFoundError,
  InvalidCustomerStateError,
  InvalidOpportunityStateError,
  OpportunityNotFoundError,
} from "../../errors/CRMErrors.js";

describe("CRM domain errors", () => {
  it("all extend DomainError with codes", () => {
    const cases: DomainError[] = [
      new CustomerNotFoundError("x"),
      new DuplicateCustomerNumberError("n", "o"),
      new ContactNotFoundError("x"),
      new DuplicatePrimaryContactError("c"),
      new DuplicateContactEmailError("e", "c"),
      new OpportunityNotFoundError("x"),
      new InvalidOpportunityStateError("bad"),
      new InteractionNotFoundError("x"),
      new InvalidCustomerStateError("bad"),
      new CRMValidationError("val"),
    ];
    for (const err of cases) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBeTruthy();
      expect(err.message.length).toBeGreaterThan(0);
    }
  });

  it("exposes specific codes", () => {
    expect(new CustomerNotFoundError("a").code).toBe("CUSTOMER_NOT_FOUND");
    expect(new DuplicateCustomerNumberError("n", "o").code).toBe(
      "DUPLICATE_CUSTOMER_NUMBER",
    );
    expect(new DuplicatePrimaryContactError("c").code).toBe(
      "DUPLICATE_PRIMARY_CONTACT",
    );
    expect(new CRMValidationError("m").code).toBe("CRM_VALIDATION");
  });
});
