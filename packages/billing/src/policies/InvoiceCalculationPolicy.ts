import { BillingValidationError } from "../errors/BillingErrors.js";
import { Money } from "../value-objects/Money.js";

export type LineInput = {
  quantity: number;
  unitPriceMinor: number;
  discountMinor: number;
  taxRate: number; // 0–1 e.g. 0.15 = 15%
  currency: string;
};

export type LineTotals = {
  lineTotal: Money;
  net: Money;
  tax: Money;
};

export type InvoiceTotals = {
  subtotal: Money;
  tax: Money;
  discount: Money;
  total: Money;
};

/**
 * All monetary calculations for invoices and lines.
 * Uses integer minor units; rounds intermediate results to nearest unit.
 */
export class InvoiceCalculationPolicy {
  static computeLineTotal(input: LineInput): LineTotals {
    if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
      throw new BillingValidationError("Quantity must be > 0.");
    }
    if (!Number.isInteger(input.unitPriceMinor) || input.unitPriceMinor < 0) {
      throw new BillingValidationError("Unit price must be ≥ 0 minor units.");
    }
    if (!Number.isInteger(input.discountMinor) || input.discountMinor < 0) {
      throw new BillingValidationError("Discount must be ≥ 0 minor units.");
    }
    if (
      !Number.isFinite(input.taxRate) ||
      input.taxRate < 0 ||
      input.taxRate > 1
    ) {
      throw new BillingValidationError("Tax rate must be between 0 and 1.");
    }

    const grossMinor = Math.round(input.quantity * input.unitPriceMinor);
    if (input.discountMinor > grossMinor) {
      throw new BillingValidationError(
        "Line discount cannot exceed line gross amount.",
      );
    }
    const netMinor = grossMinor - input.discountMinor;
    const taxMinor = Math.round(netMinor * input.taxRate);
    const lineTotalMinor = netMinor + taxMinor;

    const currency = input.currency;
    return {
      net: Money.fromMinorUnits(netMinor, currency),
      tax: Money.fromMinorUnits(taxMinor, currency),
      lineTotal: Money.fromMinorUnits(lineTotalMinor, currency),
    };
  }

  static computeInvoiceTotals(
    lines: readonly LineInput[],
    currency: string,
  ): InvoiceTotals {
    if (lines.length === 0) {
      return {
        subtotal: Money.zero(currency),
        tax: Money.zero(currency),
        discount: Money.zero(currency),
        total: Money.zero(currency),
      };
    }
    let subtotalMinor = 0;
    let taxMinor = 0;
    let discountMinor = 0;
    for (const line of lines) {
      if (line.currency !== currency) {
        throw new BillingValidationError(
          `Line currency ${line.currency} does not match invoice ${currency}.`,
        );
      }
      const gross = Math.round(line.quantity * line.unitPriceMinor);
      const net = gross - line.discountMinor;
      const tax = Math.round(net * line.taxRate);
      subtotalMinor += net;
      taxMinor += tax;
      discountMinor += line.discountMinor;
    }
    const totalMinor = subtotalMinor + taxMinor;
    return {
      subtotal: Money.fromMinorUnits(subtotalMinor, currency),
      tax: Money.fromMinorUnits(taxMinor, currency),
      discount: Money.fromMinorUnits(discountMinor, currency),
      total: Money.fromMinorUnits(totalMinor, currency),
    };
  }
}
