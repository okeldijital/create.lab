import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  BillingValidationError,
  CreditLimitExceededError,
  CreditNoteNotFoundError,
  InvalidInvoiceStateError,
  InvoiceAlreadyIssuedError,
  InvoiceAlreadyPaidError,
  InvoiceAlreadyVoidedError,
  InvoiceLineNotFoundError,
  InvoiceNotFoundError,
  PaymentExceedsBalanceError,
  PaymentNotFoundError,
} from "../../errors/BillingErrors.js";

describe("Billing domain errors", () => {
  it("all extend DomainError with codes", () => {
    const cases: DomainError[] = [
      new InvoiceNotFoundError("x"),
      new InvoiceAlreadyIssuedError("x"),
      new InvoiceAlreadyPaidError("x"),
      new InvoiceAlreadyVoidedError("x"),
      new PaymentNotFoundError("x"),
      new PaymentExceedsBalanceError("over"),
      new CreditNoteNotFoundError("x"),
      new CreditLimitExceededError("limit"),
      new InvalidInvoiceStateError("bad"),
      new BillingValidationError("val"),
      new InvoiceLineNotFoundError("x"),
    ];
    for (const err of cases) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBeTruthy();
      expect(err.message.length).toBeGreaterThan(0);
    }
  });

  it("exposes specific codes", () => {
    expect(new InvoiceNotFoundError("a").code).toBe("INVOICE_NOT_FOUND");
    expect(new PaymentExceedsBalanceError("m").code).toBe(
      "PAYMENT_EXCEEDS_BALANCE",
    );
    expect(new CreditLimitExceededError("m").code).toBe(
      "CREDIT_LIMIT_EXCEEDED",
    );
    expect(new BillingValidationError("m").code).toBe("BILLING_VALIDATION");
  });
});
