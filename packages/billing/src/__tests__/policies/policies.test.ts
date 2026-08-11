import { describe, expect, it } from "vitest";
import { asDeliveryId } from "@creative-lab/delivery";
import { asOrganizationId } from "@creative-lab/organization";
import { asProjectId } from "@creative-lab/projects";
import { CreditNote } from "../../aggregates/CreditNote/CreditNote.js";
import { Invoice } from "../../aggregates/Invoice/Invoice.js";
import { InvoiceLine } from "../../aggregates/InvoiceLine/InvoiceLine.js";
import { Payment } from "../../aggregates/Payment/Payment.js";
import { InvoiceStatus } from "../../enums/InvoiceStatus.js";
import {
  BillingValidationError,
  CreditLimitExceededError,
  InvalidInvoiceStateError,
  InvoiceAlreadyPaidError,
  PaymentExceedsBalanceError,
} from "../../errors/BillingErrors.js";
import { CreditPolicy } from "../../policies/CreditPolicy.js";
import { InvoiceCalculationPolicy } from "../../policies/InvoiceCalculationPolicy.js";
import { InvoiceLifecyclePolicy } from "../../policies/InvoiceLifecyclePolicy.js";
import { PaymentPolicy } from "../../policies/PaymentPolicy.js";
import { Money } from "../../value-objects/Money.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const deliveryId = asDeliveryId("del-1");

function draftWithLine(totalMinor = 10000) {
  const inv = Invoice.create({
    organizationId: orgId,
    projectId,
    deliveryId,
    customerId: "c1",
    currency: "USD",
  });
  const line = InvoiceLine.create({
    organizationId: orgId,
    invoiceId: inv.id,
    description: "Work",
    quantity: 1,
    unitPriceMinor: totalMinor,
    currency: "USD",
  });
  inv.recalculateFromLines([line]);
  return inv;
}

describe("InvoiceCalculationPolicy", () => {
  it("computes line totals with tax and discount", () => {
    const t = InvoiceCalculationPolicy.computeLineTotal({
      quantity: 3,
      unitPriceMinor: 1000,
      discountMinor: 500,
      taxRate: 0.2,
      currency: "USD",
    });
    // gross 3000 - 500 = 2500; tax 500; total 3000
    expect(t.net.minorUnits).toBe(2500);
    expect(t.tax.minorUnits).toBe(500);
    expect(t.lineTotal.minorUnits).toBe(3000);
  });

  it("sums invoice totals", () => {
    const totals = InvoiceCalculationPolicy.computeInvoiceTotals(
      [
        {
          quantity: 1,
          unitPriceMinor: 10000,
          discountMinor: 0,
          taxRate: 0.1,
          currency: "USD",
        },
        {
          quantity: 2,
          unitPriceMinor: 500,
          discountMinor: 100,
          taxRate: 0,
          currency: "USD",
        },
      ],
      "USD",
    );
    // line1: net 10000 tax 1000; line2: net 900 tax 0
    expect(totals.subtotal.minorUnits).toBe(10900);
    expect(totals.tax.minorUnits).toBe(1000);
    expect(totals.discount.minorUnits).toBe(100);
    expect(totals.total.minorUnits).toBe(11900);
  });

  it("empty lines yield zero totals", () => {
    const t = InvoiceCalculationPolicy.computeInvoiceTotals([], "USD");
    expect(t.total.isZero).toBe(true);
  });

  it("rejects bad quantity, tax, discount, currency mismatch", () => {
    expect(() =>
      InvoiceCalculationPolicy.computeLineTotal({
        quantity: 0,
        unitPriceMinor: 1,
        discountMinor: 0,
        taxRate: 0,
        currency: "USD",
      }),
    ).toThrow(BillingValidationError);
    expect(() =>
      InvoiceCalculationPolicy.computeLineTotal({
        quantity: 1,
        unitPriceMinor: 100,
        discountMinor: 0,
        taxRate: 1.5,
        currency: "USD",
      }),
    ).toThrow(BillingValidationError);
    expect(() =>
      InvoiceCalculationPolicy.computeInvoiceTotals(
        [
          {
            quantity: 1,
            unitPriceMinor: 1,
            discountMinor: 0,
            taxRate: 0,
            currency: "EUR",
          },
        ],
        "USD",
      ),
    ).toThrow(BillingValidationError);
  });
});

describe("InvoiceLifecyclePolicy", () => {
  it("enforces draft structural edits", () => {
    const inv = draftWithLine();
    InvoiceLifecyclePolicy.assertDraft(inv);
    inv.issue();
    expect(() => InvoiceLifecyclePolicy.assertDraft(inv)).toThrow(
      InvalidInvoiceStateError,
    );
  });

  it("blocks void of paid and illegal transitions", () => {
    const inv = draftWithLine(500);
    inv.issue();
    inv.applyPayment(Money.fromMinorUnits(500, "USD"));
    expect(() => InvoiceLifecyclePolicy.assertCanVoid(inv)).toThrow(
      InvoiceAlreadyPaidError,
    );
    expect(() =>
      InvoiceLifecyclePolicy.assertCanTransition(inv, InvoiceStatus.VOID),
    ).toThrow(InvalidInvoiceStateError);
  });

  it("allows void of issued", () => {
    const inv = draftWithLine();
    inv.issue();
    expect(() => InvoiceLifecyclePolicy.assertCanVoid(inv)).not.toThrow();
  });
});

describe("PaymentPolicy", () => {
  it("rejects exceeding balance", () => {
    const inv = draftWithLine(1000);
    inv.issue();
    expect(() =>
      PaymentPolicy.assertWithinBalance(
        inv,
        Money.fromMinorUnits(1001, "USD"),
      ),
    ).toThrow(PaymentExceedsBalanceError);
  });

  it("complete only pending; refund limit", () => {
    const inv = draftWithLine();
    inv.issue();
    const p = Payment.create({
      organizationId: orgId,
      invoiceId: inv.id,
      reference: "P1",
      amountMinor: 500,
      currency: "USD",
    });
    PaymentPolicy.assertCanComplete(p);
    p.complete();
    expect(() => PaymentPolicy.assertCanComplete(p)).toThrow(
      InvalidInvoiceStateError,
    );
    expect(() => PaymentPolicy.assertRefundLimit(p, 501)).toThrow(
      PaymentExceedsBalanceError,
    );
  });
});

describe("CreditPolicy", () => {
  it("enforces total and balance limits", () => {
    const inv = draftWithLine(1000);
    inv.issue();
    expect(() =>
      CreditPolicy.assertWithinInvoiceTotal(
        inv,
        Money.fromMinorUnits(1001, "USD"),
      ),
    ).toThrow(CreditLimitExceededError);
    inv.applyPayment(Money.fromMinorUnits(800, "USD"));
    expect(() =>
      CreditPolicy.assertWithinBalance(
        inv,
        Money.fromMinorUnits(300, "USD"),
      ),
    ).toThrow(CreditLimitExceededError);
  });

  it("prevents double apply", () => {
    const inv = draftWithLine(1000);
    inv.issue();
    const cn = CreditNote.create({
      organizationId: orgId,
      invoiceId: inv.id,
      reason: "Adj",
      amountMinor: 100,
      currency: "USD",
    });
    expect(() => CreditPolicy.assertCanApply(cn)).toThrow(
      InvalidInvoiceStateError,
    );
    cn.issue();
    CreditPolicy.assertCanApply(cn);
    cn.apply();
    expect(() => CreditPolicy.assertCanApply(cn)).toThrow(
      CreditLimitExceededError,
    );
  });
});
