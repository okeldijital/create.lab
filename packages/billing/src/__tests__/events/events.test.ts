import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { asOrganizationId } from "@creative-lab/organization";
import { CreditStatus } from "../../enums/CreditStatus.js";
import { InvoiceStatus } from "../../enums/InvoiceStatus.js";
import { PaymentStatus } from "../../enums/PaymentStatus.js";
import {
  CreditNoteApplied,
  CreditNoteArchived,
  CreditNoteCreated,
  CreditNoteIssued,
  InvoiceArchived,
  InvoiceCreated,
  InvoiceIssued,
  InvoicePaid,
  InvoicePartiallyPaid,
  InvoiceVoided,
  PaymentCompleted,
  PaymentRecorded,
  PaymentRefunded,
} from "../../events/billing-events.js";
import {
  asCreditNoteId,
  asInvoiceId,
  asPaymentId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const invoiceId = asInvoiceId("inv-1");

describe("Domain events", () => {
  it("InvoiceCreated is frozen and versioned with payload", () => {
    const e = InvoiceCreated.create({
      organizationId: orgId,
      invoiceId,
      invoiceNumber: "INV-1",
      projectId: "p",
      deliveryId: "d",
      status: InvoiceStatus.DRAFT,
      totalMinor: 0,
      currency: "USD",
    });
    expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(Object.isFrozen(e)).toBe(true);
    expect(Object.isFrozen(e.payload)).toBe(true);
    expect(e.payload.invoiceNumber).toBe("INV-1");
    expect(e.eventType).toBe("InvoiceCreated");
  });

  it("covers full billing event set", () => {
    const events = [
      InvoiceIssued.create({
        organizationId: orgId,
        invoiceId,
        issueDate: new Date(),
      }),
      InvoicePaid.create({ organizationId: orgId, invoiceId }),
      InvoicePartiallyPaid.create({
        organizationId: orgId,
        invoiceId,
        balanceMinor: 100,
      }),
      InvoiceVoided.create({ organizationId: orgId, invoiceId }),
      InvoiceArchived.create({ organizationId: orgId, invoiceId }),
      PaymentRecorded.create({
        organizationId: orgId,
        paymentId: asPaymentId("pay-1"),
        invoiceId,
        amountMinor: 500,
        status: PaymentStatus.PENDING,
      }),
      PaymentCompleted.create({
        organizationId: orgId,
        paymentId: asPaymentId("pay-1"),
        invoiceId,
      }),
      PaymentRefunded.create({
        organizationId: orgId,
        paymentId: asPaymentId("pay-1"),
        invoiceId,
        refundMinor: 100,
      }),
      CreditNoteCreated.create({
        organizationId: orgId,
        creditNoteId: asCreditNoteId("cn-1"),
        invoiceId,
        amountMinor: 50,
        status: CreditStatus.DRAFT,
      }),
      CreditNoteIssued.create({
        organizationId: orgId,
        creditNoteId: asCreditNoteId("cn-1"),
        invoiceId,
      }),
      CreditNoteApplied.create({
        organizationId: orgId,
        creditNoteId: asCreditNoteId("cn-1"),
        invoiceId,
        amountMinor: 50,
      }),
      CreditNoteArchived.create({
        organizationId: orgId,
        creditNoteId: asCreditNoteId("cn-1"),
      }),
    ];
    for (const e of events) {
      expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
      expect(Object.isFrozen(e)).toBe(true);
      expect(Object.isFrozen(e.payload)).toBe(true);
    }
  });
});
