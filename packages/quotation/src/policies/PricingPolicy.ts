import { QuotationValidationError } from "../errors/QuotationErrors.js";
import { Discount } from "../value-objects/Discount.js";
import { Money } from "../value-objects/Money.js";
import { Quantity } from "../value-objects/Quantity.js";

export type LinePricingInput = {
  quantity: number;
  unitPriceMinor: number;
  currency: string;
};

export type LinePricingResult = {
  quantity: Quantity;
  unitPrice: Money;
  lineTotal: Money;
};

export type VersionTotals = {
  subtotal: Money;
  discount: Discount;
  total: Money;
};

export class PricingPolicy {
  static computeLineTotal(input: LinePricingInput): LinePricingResult {
    const quantity = Quantity.create(input.quantity);
    const unitPrice = Money.fromMinorUnits(
      input.unitPriceMinor,
      input.currency,
    );
    const lineTotal = unitPrice.multiply(quantity.value);
    return { quantity, unitPrice, lineTotal };
  }

  static computeVersionTotals(
    lines: readonly LinePricingInput[],
    discountMinor: number,
    currency: string,
  ): VersionTotals {
    let subtotal = Money.zero(currency);
    for (const line of lines) {
      if (line.currency !== currency) {
        throw new QuotationValidationError(
          `Line currency ${line.currency} does not match quote ${currency}.`,
        );
      }
      const { lineTotal } = PricingPolicy.computeLineTotal(line);
      subtotal = subtotal.add(lineTotal);
    }
    const discount = Discount.fromMinorUnits(discountMinor, currency);
    if (discount.minorUnits > subtotal.minorUnits) {
      throw new QuotationValidationError(
        "Discount cannot exceed subtotal.",
      );
    }
    const total = subtotal.subtract(discount.toMoney());
    return { subtotal, discount, total };
  }
}
