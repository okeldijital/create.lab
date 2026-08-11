import { describe, expect, it, beforeEach } from "vitest";
import { asDeliveryId } from "@creative-lab/delivery";
import { Organization, asOrganizationId } from "@creative-lab/organization";
import { asProjectId } from "@creative-lab/projects";
import { CreditStatus } from "../../enums/CreditStatus.js";
import { InvoiceStatus } from "../../enums/InvoiceStatus.js";
import { PaymentMethod } from "../../enums/PaymentMethod.js";
import { PaymentStatus } from "../../enums/PaymentStatus.js";
import {
  CreditLimitExceededError,
  CreditNoteNotFoundError,
  InvoiceAlreadyPaidError,
  InvoiceNotFoundError,
  PaymentExceedsBalanceError,
  PaymentNotFoundError,
} from "../../errors/BillingErrors.js";
import {
  CreditNoteApplied,
  CreditNoteCreated,
  CreditNoteIssued,
  InvoiceCreated,
  InvoiceIssued,
  InvoicePaid,
  InvoicePartiallyPaid,
  InvoiceVoided,
  PaymentCompleted,
  PaymentRecorded,
  PaymentRefunded,
} from "../../events/billing-events.js";
import { CreditNoteService } from "../../services/CreditNoteService.js";
import { InvoiceLineService } from "../../services/InvoiceLineService.js";
import { InvoiceService } from "../../services/InvoiceService.js";
import { PaymentService } from "../../services/PaymentService.js";
import {
  InMemoryCreditNoteRepository,
  InMemoryEventPublisher,
  InMemoryInvoiceLineRepository,
  InMemoryInvoiceRepository,
  InMemoryOrganizationRepository,
  InMemoryPaymentRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const deliveryId = asDeliveryId("del-1");

describe("Billing services", () => {
  let orgs: InMemoryOrganizationRepository;
  let invoices: InMemoryInvoiceRepository;
  let lines: InMemoryInvoiceLineRepository;
  let payments: InMemoryPaymentRepository;
  let credits: InMemoryCreditNoteRepository;
  let events: InMemoryEventPublisher;
  let invoiceService: InvoiceService;
  let lineService: InvoiceLineService;
  let paymentService: PaymentService;
  let creditService: CreditNoteService;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    invoices = new InMemoryInvoiceRepository();
    lines = new InMemoryInvoiceLineRepository();
    payments = new InMemoryPaymentRepository();
    credits = new InMemoryCreditNoteRepository();
    events = new InMemoryEventPublisher();
    await orgs.save(
      Organization.create({ name: "Studio", slug: "studio", id: orgId }),
    );
    invoiceService = new InvoiceService({
      invoiceRepository: invoices,
      invoiceLineRepository: lines,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    lineService = new InvoiceLineService({
      invoiceLineRepository: lines,
      invoiceRepository: invoices,
      eventPublisher: events,
    });
    paymentService = new PaymentService({
      paymentRepository: payments,
      invoiceRepository: invoices,
      eventPublisher: events,
    });
    creditService = new CreditNoteService({
      creditNoteRepository: credits,
      invoiceRepository: invoices,
      eventPublisher: events,
    });
  });

  async function createIssuedInvoice(unitPriceMinor = 10000) {
    const inv = await invoiceService.create({
      organizationId: orgId,
      projectId,
      deliveryId,
      customerId: "cust-1",
      currency: "USD",
    });
    await lineService.add({
      organizationId: orgId,
      invoiceId: inv.id,
      description: "Production work",
      quantity: 1,
      unitPriceMinor,
      currency: "USD",
    });
    return invoiceService.issue(inv.id);
  }

  it("creates invoice and publishes InvoiceCreated", async () => {
    const inv = await invoiceService.create({
      organizationId: orgId,
      projectId,
      deliveryId,
      customerId: "cust-1",
    });
    expect(inv.status).toBe(InvoiceStatus.DRAFT);
    expect(inv.invoiceNumber.value.startsWith("INV-")).toBe(true);
    expect(events.events.some((e) => e instanceof InvoiceCreated)).toBe(true);
  });

  it("issues invoice with lines", async () => {
    const inv = await createIssuedInvoice(5000);
    expect(inv.status).toBe(InvoiceStatus.ISSUED);
    expect(inv.total.minorUnits).toBe(5000);
    expect(events.events.some((e) => e instanceof InvoiceIssued)).toBe(true);
  });

  it("records full payment", async () => {
    const inv = await createIssuedInvoice(10000);
    const payment = await paymentService.record({
      organizationId: orgId,
      invoiceId: inv.id,
      reference: "PAY-FULL",
      amountMinor: 10000,
      method: PaymentMethod.CARD,
    });
    expect(payment.status).toBe(PaymentStatus.COMPLETED);
    expect(events.events.some((e) => e instanceof PaymentRecorded)).toBe(true);
    expect(events.events.some((e) => e instanceof PaymentCompleted)).toBe(true);
    const paid = await invoiceService.getById(inv.id);
    expect(paid.status).toBe(InvoiceStatus.PAID);
    expect(events.events.some((e) => e instanceof InvoicePaid)).toBe(true);
  });

  it("records partial payment", async () => {
    const inv = await createIssuedInvoice(10000);
    await paymentService.record({
      organizationId: orgId,
      invoiceId: inv.id,
      reference: "PAY-PART",
      amountMinor: 4000,
    });
    const updated = await invoiceService.getById(inv.id);
    expect(updated.status).toBe(InvoiceStatus.PARTIALLY_PAID);
    expect(updated.balance.minorUnits).toBe(6000);
    expect(events.events.some((e) => e instanceof InvoicePartiallyPaid)).toBe(
      true,
    );
  });

  it("rejects payment exceeding balance", async () => {
    const inv = await createIssuedInvoice(1000);
    await expect(
      paymentService.record({
        organizationId: orgId,
        invoiceId: inv.id,
        reference: "OVER",
        amountMinor: 1001,
      }),
    ).rejects.toThrow(PaymentExceedsBalanceError);
  });

  it("completes deferred payment", async () => {
    const inv = await createIssuedInvoice(2000);
    const payment = await paymentService.record({
      organizationId: orgId,
      invoiceId: inv.id,
      reference: "DEFER",
      amountMinor: 2000,
      completeImmediately: false,
    });
    expect(payment.status).toBe(PaymentStatus.PENDING);
    expect((await invoiceService.getById(inv.id)).status).toBe(
      InvoiceStatus.ISSUED,
    );
    await paymentService.complete(payment.id);
    expect((await invoiceService.getById(inv.id)).isPaid).toBe(true);
  });

  it("refunds payment and restores balance", async () => {
    const inv = await createIssuedInvoice(10000);
    const payment = await paymentService.record({
      organizationId: orgId,
      invoiceId: inv.id,
      reference: "REF",
      amountMinor: 10000,
    });
    await paymentService.refund(payment.id, 3000);
    expect(events.events.some((e) => e instanceof PaymentRefunded)).toBe(true);
    const updated = await invoiceService.getById(inv.id);
    expect(updated.status).toBe(InvoiceStatus.PARTIALLY_PAID);
    expect(updated.balance.minorUnits).toBe(3000);
  });

  it("credit note create issue apply", async () => {
    const inv = await createIssuedInvoice(10000);
    const note = await creditService.create({
      organizationId: orgId,
      invoiceId: inv.id,
      reason: "Scope reduction",
      amountMinor: 2500,
      currency: "USD",
    });
    expect(note.status).toBe(CreditStatus.DRAFT);
    expect(events.events.some((e) => e instanceof CreditNoteCreated)).toBe(
      true,
    );
    await creditService.issue(note.id);
    expect(events.events.some((e) => e instanceof CreditNoteIssued)).toBe(true);
    await creditService.apply(note.id);
    expect(events.events.some((e) => e instanceof CreditNoteApplied)).toBe(
      true,
    );
    const updated = await invoiceService.getById(inv.id);
    expect(updated.credited.minorUnits).toBe(2500);
    expect(updated.balance.minorUnits).toBe(7500);
  });

  it("rejects credit exceeding total", async () => {
    const inv = await createIssuedInvoice(1000);
    await expect(
      creditService.create({
        organizationId: orgId,
        invoiceId: inv.id,
        reason: "Too much",
        amountMinor: 1001,
        currency: "USD",
      }),
    ).rejects.toThrow(CreditLimitExceededError);
  });

  it("voids issued invoice", async () => {
    const inv = await createIssuedInvoice(1000);
    await invoiceService.void(inv.id);
    expect((await invoiceService.getById(inv.id)).isVoid).toBe(true);
    expect(events.events.some((e) => e instanceof InvoiceVoided)).toBe(true);
  });

  it("cannot void paid invoice", async () => {
    const inv = await createIssuedInvoice(1000);
    await paymentService.record({
      organizationId: orgId,
      invoiceId: inv.id,
      reference: "P",
      amountMinor: 1000,
    });
    await expect(invoiceService.void(inv.id)).rejects.toThrow(
      InvoiceAlreadyPaidError,
    );
  });

  it("archives invoice", async () => {
    const inv = await createIssuedInvoice(1000);
    await invoiceService.archive(inv.id);
    expect((await invoiceService.getById(inv.id)).isArchived).toBe(true);
  });

  it("add and remove lines recalculates", async () => {
    const inv = await invoiceService.create({
      organizationId: orgId,
      projectId,
      deliveryId,
      customerId: "c",
    });
    const line = await lineService.add({
      organizationId: orgId,
      invoiceId: inv.id,
      description: "A",
      quantity: 1,
      unitPriceMinor: 1000,
      currency: "USD",
    });
    expect((await invoiceService.getById(inv.id)).total.minorUnits).toBe(1000);
    await lineService.remove(line.id);
    expect((await invoiceService.getById(inv.id)).total.minorUnits).toBe(0);
    expect((await lineService.listByInvoice(inv.id)).length).toBe(0);
  });

  it("list queries by org project delivery outstanding", async () => {
    const inv = await createIssuedInvoice(500);
    expect((await invoiceService.listByOrganization(orgId)).length).toBe(1);
    expect((await invoiceService.listByProject(projectId)).length).toBe(1);
    expect((await invoiceService.listByDelivery(deliveryId)).length).toBe(1);
    expect((await invoiceService.listOutstanding()).length).toBe(1);
    await paymentService.record({
      organizationId: orgId,
      invoiceId: inv.id,
      reference: "X",
      amountMinor: 500,
    });
    expect((await invoiceService.listOutstanding()).length).toBe(0);
  });

  it("throws not found errors", async () => {
    await expect(invoiceService.getById("missing" as never)).rejects.toThrow(
      InvoiceNotFoundError,
    );
    await expect(paymentService.getById("missing" as never)).rejects.toThrow(
      PaymentNotFoundError,
    );
    await expect(creditService.getById("missing" as never)).rejects.toThrow(
      CreditNoteNotFoundError,
    );
  });

  it("payment + credit can fully settle", async () => {
    const inv = await createIssuedInvoice(10000);
    await paymentService.record({
      organizationId: orgId,
      invoiceId: inv.id,
      reference: "P",
      amountMinor: 7000,
    });
    const note = await creditService.create({
      organizationId: orgId,
      invoiceId: inv.id,
      reason: "Discount",
      amountMinor: 3000,
      currency: "USD",
    });
    await creditService.issue(note.id);
    await creditService.apply(note.id);
    const settled = await invoiceService.getById(inv.id);
    expect(settled.isPaid).toBe(true);
    expect(settled.balance.isZero).toBe(true);
  });
});
