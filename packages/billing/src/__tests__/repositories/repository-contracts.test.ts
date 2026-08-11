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
  InMemoryCreditNoteRepository,
  InMemoryInvoiceLineRepository,
  InMemoryInvoiceRepository,
  InMemoryPaymentRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");
const deliveryId = asDeliveryId("del-1");

describe("Repository contracts", () => {
  it("InvoiceRepository ports", async () => {
    const repo = new InMemoryInvoiceRepository();
    const inv = Invoice.create({
      organizationId: orgId,
      projectId,
      deliveryId,
      customerId: "cust-a",
      invoiceNumber: "INV-REPO-1",
      currency: "USD",
    });
    const line = InvoiceLine.create({
      organizationId: orgId,
      invoiceId: inv.id,
      description: "Svc",
      quantity: 1,
      unitPriceMinor: 1000,
      currency: "USD",
    });
    inv.recalculateFromLines([line]);
    inv.issue();
    await repo.save(inv);

    expect(await repo.exists(inv.id)).toBe(true);
    expect((await repo.findByOrganization(orgId))[0]?.id).toBe(inv.id);
    expect((await repo.findByProject(projectId))[0]?.id).toBe(inv.id);
    expect((await repo.findByDelivery(deliveryId))[0]?.id).toBe(inv.id);
    expect((await repo.findByCustomer("cust-a"))[0]?.id).toBe(inv.id);
    expect((await repo.findByInvoiceNumber("INV-REPO-1"))?.id).toBe(inv.id);
    expect((await repo.findOutstanding()).length).toBe(1);
    expect((await repo.findPaid()).length).toBe(0);

    inv.applyPayment(
      (await import("../../value-objects/Money.js")).Money.fromMinorUnits(
        1000,
        "USD",
      ),
    );
    await repo.update(inv);
    expect(inv.status).toBe(InvoiceStatus.PAID);
    expect((await repo.findPaid()).length).toBe(1);
    expect((await repo.findOutstanding()).length).toBe(0);
    await repo.archive(inv.id);
  });

  it("InvoiceLineRepository ports", async () => {
    const inv = Invoice.create({
      organizationId: orgId,
      projectId,
      deliveryId,
      customerId: "c",
    });
    const repo = new InMemoryInvoiceLineRepository();
    const line = InvoiceLine.create({
      organizationId: orgId,
      invoiceId: inv.id,
      description: "L",
      quantity: 1,
      unitPriceMinor: 100,
      currency: "USD",
    });
    await repo.save(line);
    expect((await repo.findByInvoice(inv.id)).length).toBe(1);
    expect((await repo.findById(line.id))?.id).toBe(line.id);
    await repo.delete(line.id);
    expect((await repo.findByInvoice(inv.id)).length).toBe(0);
  });

  it("PaymentRepository and CreditNoteRepository ports", async () => {
    const inv = Invoice.create({
      organizationId: orgId,
      projectId,
      deliveryId,
      customerId: "c",
    });
    const pRepo = new InMemoryPaymentRepository();
    const payment = Payment.create({
      organizationId: orgId,
      invoiceId: inv.id,
      reference: "PAY-R",
      amountMinor: 100,
      currency: "USD",
    });
    await pRepo.save(payment);
    expect((await pRepo.findByInvoice(inv.id)).length).toBe(1);
    payment.complete();
    await pRepo.update(payment);
    expect((await pRepo.findById(payment.id))?.isCompleted).toBe(true);

    const cRepo = new InMemoryCreditNoteRepository();
    const cn = CreditNote.create({
      organizationId: orgId,
      invoiceId: inv.id,
      reason: "Adj",
      amountMinor: 50,
      currency: "USD",
    });
    await cRepo.save(cn);
    expect((await cRepo.findByInvoice(inv.id)).length).toBe(1);
    cn.issue();
    await cRepo.update(cn);
    expect((await cRepo.findById(cn.id))?.status).toBe("ISSUED");
  });
});
