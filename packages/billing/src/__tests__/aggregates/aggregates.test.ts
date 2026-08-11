import { describe, expect, it } from "vitest";
import { asDeliveryId } from "@creative-lab/delivery";
import { asOrganizationId } from "@creative-lab/organization";
import { asProjectId } from "@creative-lab/projects";
import { CreditNote } from "../../aggregates/CreditNote/CreditNote.js";
import { Invoice } from "../../aggregates/Invoice/Invoice.js";
import { InvoiceLine } from "../../aggregates/InvoiceLine/InvoiceLine.js";
import { Payment } from "../../aggregates/Payment/Payment.js";
import { CreditStatus } from "../../enums/CreditStatus.js";
import { InvoiceStatus } from "../../enums/InvoiceStatus.js";
import { PaymentMethod } from "../../enums/PaymentMethod.js";
import { PaymentStatus } from "../../enums/PaymentStatus.js";
import {
  BillingValidationError,
  CreditLimitExceededError,
  InvalidInvoiceStateError,
  InvoiceAlreadyPaidError,
} from "../../errors/BillingErrors.js";
import {
  CreditNoteCreated,
  InvoiceCreated,
  InvoiceIssued,
  InvoicePaid,
  InvoicePartiallyPaid,
  InvoiceVoided,
  PaymentRecorded,
} from "../../events/billing-events.js";
import { Money } from "../../value-objects/Money.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const deliveryId = asDeliveryId("del-1");

function createInvoice(
  overrides: Partial<Parameters<typeof Invoice.create>[0]> = {},
) {
  return Invoice.create({
    organizationId: orgId,
    projectId,
    deliveryId,
    customerId: "cust-1",
    currency: "USD",
    invoiceNumber: "INV-TEST-001",
    ...overrides,
  });
}

function addLine(
  invoice: Invoice,
  unitPriceMinor = 10000,
  qty = 1,
  taxRate = 0,
) {
  const line = InvoiceLine.create({
    organizationId: orgId,
    invoiceId: invoice.id,
    description: "Creative services",
    quantity: qty,
    unitPriceMinor,
    taxRate,
    currency: "USD",
  });
  invoice.recalculateFromLines([line]);
  return line;
}

describe("Invoice aggregate", () => {
  it("creates DRAFT with event and immutable refs", () => {
    const inv = createInvoice();
    expect(inv.status).toBe(InvoiceStatus.DRAFT);
    expect(inv.invoiceNumber.value).toBe("INV-TEST-001");
    expect(inv.projectId).toBe(projectId);
    expect(inv.deliveryId).toBe(deliveryId);
    expect(inv.currency.code).toBe("USD");
    expect(inv.pullDomainEvents()[0]).toBeInstanceOf(InvoiceCreated);
  });

  it("requires project, delivery, customer", () => {
    expect(() =>
      Invoice.create({
        organizationId: orgId,
        projectId: "" as never,
        deliveryId,
        customerId: "c",
      }),
    ).toThrow(InvalidInvoiceStateError);
    expect(() =>
      createInvoice({ customerId: "  " }),
    ).toThrow(InvalidInvoiceStateError);
  });

  it("issues after lines and sets issue date", () => {
    const inv = createInvoice();
    inv.pullDomainEvents();
    addLine(inv);
    inv.issue();
    expect(inv.status).toBe(InvoiceStatus.ISSUED);
    expect(inv.issueDate).not.toBeNull();
    expect(inv.total.minorUnits).toBe(10000);
    expect(inv.balance.minorUnits).toBe(10000);
    expect(inv.pullDomainEvents()[0]).toBeInstanceOf(InvoiceIssued);
  });

  it("cannot issue without lines", () => {
    const inv = createInvoice();
    expect(() => inv.issue()).toThrow(InvalidInvoiceStateError);
  });

  it("partial then full payment", () => {
    const inv = createInvoice();
    inv.pullDomainEvents();
    addLine(inv, 10000);
    inv.issue();
    inv.pullDomainEvents();
    inv.applyPayment(Money.fromMinorUnits(4000, "USD"));
    expect(inv.status).toBe(InvoiceStatus.PARTIALLY_PAID);
    expect(inv.balance.minorUnits).toBe(6000);
    expect(inv.pullDomainEvents()[0]).toBeInstanceOf(InvoicePartiallyPaid);
    inv.applyPayment(Money.fromMinorUnits(6000, "USD"));
    expect(inv.status).toBe(InvoiceStatus.PAID);
    expect(inv.balance.isZero).toBe(true);
    expect(inv.pullDomainEvents().some((e) => e instanceof InvoicePaid)).toBe(
      true,
    );
  });

  it("rejects payment over balance and on paid", () => {
    const inv = createInvoice();
    addLine(inv, 1000);
    inv.issue();
    expect(() =>
      inv.applyPayment(Money.fromMinorUnits(2000, "USD")),
    ).toThrow(InvalidInvoiceStateError);
    inv.applyPayment(Money.fromMinorUnits(1000, "USD"));
    expect(() =>
      inv.applyPayment(Money.fromMinorUnits(1, "USD")),
    ).toThrow(InvoiceAlreadyPaidError);
  });

  it("voids issued but not paid", () => {
    const inv = createInvoice();
    inv.pullDomainEvents();
    addLine(inv);
    inv.issue();
    inv.pullDomainEvents();
    inv.void();
    expect(inv.isVoid).toBe(true);
    expect(inv.pullDomainEvents()[0]).toBeInstanceOf(InvoiceVoided);
  });

  it("cannot void paid invoice", () => {
    const inv = createInvoice();
    addLine(inv, 500);
    inv.issue();
    inv.applyPayment(Money.fromMinorUnits(500, "USD"));
    expect(() => inv.void()).toThrow(InvoiceAlreadyPaidError);
  });

  it("archives and becomes immutable", () => {
    const inv = createInvoice();
    inv.archive();
    expect(inv.isArchived).toBe(true);
    expect(() => inv.issue()).toThrow(InvalidInvoiceStateError);
  });

  it("cannot modify lines after issued", () => {
    const inv = createInvoice();
    const line = addLine(inv);
    inv.issue();
    expect(() => inv.recalculateFromLines([line])).toThrow(
      InvalidInvoiceStateError,
    );
  });

  it("apply credit reduces balance", () => {
    const inv = createInvoice();
    addLine(inv, 10000);
    inv.issue();
    inv.applyCredit(Money.fromMinorUnits(2500, "USD"));
    expect(inv.credited.minorUnits).toBe(2500);
    expect(inv.balance.minorUnits).toBe(7500);
    expect(inv.status).toBe(InvoiceStatus.PARTIALLY_PAID);
  });

  it("reverse payment restores balance", () => {
    const inv = createInvoice();
    addLine(inv, 10000);
    inv.issue();
    inv.applyPayment(Money.fromMinorUnits(10000, "USD"));
    expect(inv.isPaid).toBe(true);
    inv.reversePayment(Money.fromMinorUnits(3000, "USD"));
    expect(inv.status).toBe(InvoiceStatus.PARTIALLY_PAID);
    expect(inv.balance.minorUnits).toBe(3000);
    expect(inv.paid.minorUnits).toBe(7000);
  });

  it("reconstitutes snapshot", () => {
    const inv = createInvoice({ invoiceNumber: "INV-SNAP" });
    addLine(inv, 2000);
    const r = Invoice.reconstitute(inv.toSnapshot());
    expect(r.invoiceNumber.value).toBe("INV-SNAP");
    expect(r.total.minorUnits).toBe(2000);
  });
});

describe("InvoiceLine aggregate", () => {
  it("computes immutable line total with tax", () => {
    const inv = createInvoice();
    const line = InvoiceLine.create({
      organizationId: orgId,
      invoiceId: inv.id,
      description: "Mix",
      quantity: 2,
      unitPriceMinor: 1000,
      discountMinor: 100,
      taxRate: 0.1,
      currency: "USD",
    });
    // gross 2000 - 100 = 1900 + tax 190 = 2090
    expect(line.lineTotal.minorUnits).toBe(2090);
    expect(line.quantity).toBe(2);
  });

  it("rejects invalid quantity and price", () => {
    const inv = createInvoice();
    expect(() =>
      InvoiceLine.create({
        organizationId: orgId,
        invoiceId: inv.id,
        description: "Bad",
        quantity: 0,
        unitPriceMinor: 100,
        currency: "USD",
      }),
    ).toThrow(BillingValidationError);
    expect(() =>
      InvoiceLine.create({
        organizationId: orgId,
        invoiceId: inv.id,
        description: "Bad",
        quantity: 1,
        unitPriceMinor: -1,
        currency: "USD",
      }),
    ).toThrow(BillingValidationError);
  });

  it("reconstitutes", () => {
    const inv = createInvoice();
    const line = InvoiceLine.create({
      organizationId: orgId,
      invoiceId: inv.id,
      description: "X",
      quantity: 1,
      unitPriceMinor: 50,
      currency: "USD",
    });
    const r = InvoiceLine.reconstitute(line.toSnapshot());
    expect(r.lineTotal.minorUnits).toBe(50);
  });
});

describe("Payment aggregate", () => {
  it("creates PENDING and completes", () => {
    const inv = createInvoice();
    addLine(inv);
    inv.issue();
    const p = Payment.create({
      organizationId: orgId,
      invoiceId: inv.id,
      reference: "TXN-1",
      amountMinor: 1000,
      currency: "USD",
      method: PaymentMethod.BANK_TRANSFER,
    });
    expect(p.status).toBe(PaymentStatus.PENDING);
    expect(p.pullDomainEvents()[0]).toBeInstanceOf(PaymentRecorded);
    p.complete();
    expect(p.isCompleted).toBe(true);
  });

  it("rejects zero amount", () => {
    const inv = createInvoice();
    expect(() =>
      Payment.create({
        organizationId: orgId,
        invoiceId: inv.id,
        reference: "Z",
        amountMinor: 0,
        currency: "USD",
      }),
    ).toThrow(InvalidInvoiceStateError);
  });

  it("refunds completed only within amount", () => {
    const inv = createInvoice();
    const p = Payment.create({
      organizationId: orgId,
      invoiceId: inv.id,
      reference: "R",
      amountMinor: 5000,
      currency: "USD",
    });
    p.complete();
    p.refund(2000);
    expect(p.refunded.minorUnits).toBe(2000);
    expect(p.status).toBe(PaymentStatus.COMPLETED);
    p.refund(3000);
    expect(p.status).toBe(PaymentStatus.REFUNDED);
    expect(() => p.refund(1)).toThrow(InvalidInvoiceStateError);
  });

  it("fails pending payment", () => {
    const inv = createInvoice();
    const p = Payment.create({
      organizationId: orgId,
      invoiceId: inv.id,
      reference: "F",
      amountMinor: 100,
      currency: "USD",
    });
    p.fail();
    expect(p.status).toBe(PaymentStatus.FAILED);
    expect(() => p.complete()).toThrow(InvalidInvoiceStateError);
  });
});

describe("CreditNote aggregate", () => {
  it("lifecycle DRAFT → ISSUED → APPLIED → ARCHIVED", () => {
    const inv = createInvoice();
    addLine(inv, 10000);
    inv.issue();
    const cn = CreditNote.create({
      organizationId: orgId,
      invoiceId: inv.id,
      reason: "Goodwill",
      amountMinor: 1000,
      currency: "USD",
    });
    expect(cn.status).toBe(CreditStatus.DRAFT);
    expect(cn.pullDomainEvents()[0]).toBeInstanceOf(CreditNoteCreated);
    cn.issue();
    expect(cn.status).toBe(CreditStatus.ISSUED);
    cn.apply();
    expect(cn.isApplied).toBe(true);
    expect(() => cn.apply()).toThrow(CreditLimitExceededError);
    cn.archive();
    expect(cn.status).toBe(CreditStatus.ARCHIVED);
  });

  it("cannot apply draft", () => {
    const inv = createInvoice();
    const cn = CreditNote.create({
      organizationId: orgId,
      invoiceId: inv.id,
      reason: "X",
      amountMinor: 100,
      currency: "USD",
    });
    expect(() => cn.apply()).toThrow(InvalidInvoiceStateError);
  });
});
