import type { CreditNote } from "../aggregates/CreditNote/CreditNote.js";
import type { Invoice } from "../aggregates/Invoice/Invoice.js";
import {
  CreditLimitExceededError,
  InvalidInvoiceStateError,
} from "../errors/BillingErrors.js";
import type { Money } from "../value-objects/Money.js";

export class CreditPolicy {
  static assertWithinInvoiceTotal(invoice: Invoice, amount: Money): void {
    if (amount.greaterThan(invoice.total)) {
      throw new CreditLimitExceededError(
        `Credit ${amount.minorUnits} exceeds invoice total ${invoice.total.minorUnits}.`,
      );
    }
  }

  static assertWithinBalance(invoice: Invoice, amount: Money): void {
    if (amount.greaterThan(invoice.balance)) {
      throw new CreditLimitExceededError(
        `Credit ${amount.minorUnits} exceeds outstanding balance ${invoice.balance.minorUnits}.`,
      );
    }
  }

  static assertCanApply(credit: CreditNote): void {
    if (credit.isApplied) {
      throw new CreditLimitExceededError(
        "Credit note has already been applied.",
      );
    }
    if (credit.status !== "ISSUED") {
      throw new InvalidInvoiceStateError(
        `Only ISSUED credit notes can be applied (status: ${credit.status}).`,
      );
    }
  }
}
