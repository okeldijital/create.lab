import type { Invoice } from "../aggregates/Invoice/Invoice.js";
import type { Payment } from "../aggregates/Payment/Payment.js";
import {
  InvalidInvoiceStateError,
  PaymentExceedsBalanceError,
} from "../errors/BillingErrors.js";
import { Money } from "../value-objects/Money.js";

export class PaymentPolicy {
  static assertWithinBalance(invoice: Invoice, amount: Money): void {
    if (amount.greaterThan(invoice.balance)) {
      throw new PaymentExceedsBalanceError(
        `Payment ${amount.minorUnits} exceeds outstanding balance ${invoice.balance.minorUnits}.`,
      );
    }
  }

  static assertCanComplete(payment: Payment): void {
    if (payment.status !== "PENDING") {
      throw new InvalidInvoiceStateError(
        `Only PENDING payments can complete (status: ${payment.status}).`,
      );
    }
  }

  static assertRefundLimit(payment: Payment, refundMinor: number): void {
    const refund = Money.fromMinorUnits(
      refundMinor,
      payment.amount.currencyCode,
    );
    const remaining = payment.amount.subtract(payment.refunded);
    if (refund.greaterThan(remaining)) {
      throw new PaymentExceedsBalanceError(
        "Refund cannot exceed paid amount.",
      );
    }
  }
}
