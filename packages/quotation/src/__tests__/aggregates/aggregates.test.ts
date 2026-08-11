import { describe, expect, it } from "vitest";
import { asCustomerId } from "@creative-lab/crm";
import { asOrganizationId } from "@creative-lab/organization";
import { asServiceId } from "@creative-lab/services";
import { Quote } from "../../aggregates/Quote/Quote.js";
import { QuoteApproval } from "../../aggregates/QuoteApproval/QuoteApproval.js";
import { QuoteLine } from "../../aggregates/QuoteLine/QuoteLine.js";
import { QuoteVersion } from "../../aggregates/QuoteVersion/QuoteVersion.js";
import { ApprovalStatus } from "../../enums/ApprovalStatus.js";
import { QuoteStatus } from "../../enums/QuoteStatus.js";
import { QuoteVersionStatus } from "../../enums/QuoteVersionStatus.js";
import {
  InvalidQuoteStateError,
  QuoteAlreadyAcceptedError,
  QuoteApprovalError,
  QuotationValidationError,
} from "../../errors/QuotationErrors.js";
import {
  QuoteCreated,
  QuoteIssued,
  QuoteVersionCreated,
} from "../../events/quotation-events.js";

const orgId = asOrganizationId("org-1");
const customerId = asCustomerId("cust-1");
const serviceId = asServiceId("svc-1");

describe("Quote aggregate", () => {
  it("creates DRAFT with event", () => {
    const q = Quote.create({
      organizationId: orgId,
      customerId,
      quoteNumber: "Q-001",
    });
    expect(q.status).toBe(QuoteStatus.DRAFT);
    expect(q.quoteNumber.value).toBe("Q-001");
    expect(q.pullDomainEvents()[0]).toBeInstanceOf(QuoteCreated);
  });

  it("issues with current version", () => {
    const q = Quote.create({
      organizationId: orgId,
      customerId,
    });
    q.pullDomainEvents();
    q.setCurrentVersion("ver-1" as never);
    q.issue();
    expect(q.isIssued).toBe(true);
    expect(q.pullDomainEvents()[0]).toBeInstanceOf(QuoteIssued);
  });

  it("cannot issue without version", () => {
    const q = Quote.create({ organizationId: orgId, customerId });
    expect(() => q.issue()).toThrow(InvalidQuoteStateError);
  });

  it("accept decline expire archive", () => {
    const q = Quote.create({ organizationId: orgId, customerId });
    q.setCurrentVersion("v1" as never);
    q.issue();
    q.accept();
    expect(q.isAccepted).toBe(true);
    expect(() => q.accept()).toThrow(QuoteAlreadyAcceptedError);

    const q2 = Quote.create({ organizationId: orgId, customerId });
    q2.setCurrentVersion("v1" as never);
    q2.issue();
    q2.decline();
    expect(q2.status).toBe(QuoteStatus.DECLINED);

    const q3 = Quote.create({ organizationId: orgId, customerId });
    q3.setCurrentVersion("v1" as never);
    q3.issue();
    q3.expire();
    expect(q3.status).toBe(QuoteStatus.EXPIRED);
    q3.archive();
    expect(q3.isArchived).toBe(true);
    expect(() => q3.issue()).toThrow(InvalidQuoteStateError);
  });

  it("reconstitutes", () => {
    const q = Quote.create({
      organizationId: orgId,
      customerId,
      quoteNumber: "SNAP",
    });
    const r = Quote.reconstitute(q.toSnapshot());
    expect(r.quoteNumber.value).toBe("SNAP");
  });

  it("validity period", () => {
    const q = Quote.create({
      organizationId: orgId,
      customerId,
      validUntil: new Date("2020-01-01"),
    });
    expect(q.isPastValidUntil(new Date("2021-01-01"))).toBe(true);
  });
});

describe("QuoteVersion aggregate", () => {
  it("creates CURRENT and recalculates", () => {
    const q = Quote.create({ organizationId: orgId, customerId });
    const v = QuoteVersion.create({
      organizationId: orgId,
      quoteId: q.id,
      versionNumber: 1,
      currency: "USD",
    });
    expect(v.status).toBe(QuoteVersionStatus.CURRENT);
    expect(v.pullDomainEvents()[0]).toBeInstanceOf(QuoteVersionCreated);

    const line = QuoteLine.create({
      organizationId: orgId,
      quoteVersionId: v.id,
      serviceId,
      description: "Mix",
      quantity: 2,
      unitPriceMinor: 1000,
      currency: "USD",
    });
    v.recalculateFromLines([line]);
    expect(v.subtotal.minorUnits).toBe(2000);
    expect(v.total.minorUnits).toBe(2000);
  });

  it("applies discount and locks", () => {
    const q = Quote.create({ organizationId: orgId, customerId });
    const v = QuoteVersion.create({
      organizationId: orgId,
      quoteId: q.id,
      versionNumber: 1,
      currency: "USD",
      discountMinor: 100,
    });
    const line = QuoteLine.create({
      organizationId: orgId,
      quoteVersionId: v.id,
      serviceId,
      description: "A",
      quantity: 1,
      unitPriceMinor: 1000,
      currency: "USD",
    });
    v.recalculateFromLines([line], 100);
    expect(v.total.minorUnits).toBe(900);
    v.lock();
    expect(() => v.recalculateFromLines([])).toThrow(InvalidQuoteStateError);
  });

  it("supersede and promote", () => {
    const q = Quote.create({ organizationId: orgId, customerId });
    const v1 = QuoteVersion.create({
      organizationId: orgId,
      quoteId: q.id,
      versionNumber: 1,
      currency: "USD",
    });
    v1.pullDomainEvents();
    v1.supersede();
    expect(v1.status).toBe(QuoteVersionStatus.SUPERSEDED);
    const v2 = QuoteVersion.create({
      organizationId: orgId,
      quoteId: q.id,
      versionNumber: 2,
      currency: "USD",
    });
    v2.pullDomainEvents();
    v2.promote(v1.id);
    expect(v2.isCurrent).toBe(true);
  });
});

describe("QuoteLine aggregate", () => {
  it("computes line total", () => {
    const line = QuoteLine.create({
      organizationId: orgId,
      quoteVersionId: "v1" as never,
      serviceId,
      description: "Work",
      quantity: 3,
      unitPriceMinor: 500,
      currency: "USD",
    });
    expect(line.lineTotal.minorUnits).toBe(1500);
  });

  it("rejects bad quantity and price", () => {
    expect(() =>
      QuoteLine.create({
        organizationId: orgId,
        quoteVersionId: "v1" as never,
        serviceId,
        description: "X",
        quantity: 0,
        unitPriceMinor: 100,
        currency: "USD",
      }),
    ).toThrow(QuotationValidationError);
  });
});

describe("QuoteApproval aggregate", () => {
  it("accept and decline are terminal", () => {
    const q = Quote.create({ organizationId: orgId, customerId });
    const a = QuoteApproval.create({
      organizationId: orgId,
      quoteId: q.id,
    });
    expect(a.isPending).toBe(true);
    a.accept();
    expect(a.status).toBe(ApprovalStatus.ACCEPTED);
    expect(() => a.decline()).toThrow(QuoteApprovalError);

    const b = QuoteApproval.create({
      organizationId: orgId,
      quoteId: q.id,
    });
    b.decline();
    expect(b.status).toBe(ApprovalStatus.DECLINED);
  });

  it("reconstitutes approval", () => {
    const q = Quote.create({ organizationId: orgId, customerId });
    const a = QuoteApproval.create({
      organizationId: orgId,
      quoteId: q.id,
      notes: "note",
    });
    const r = QuoteApproval.reconstitute(a.toSnapshot());
    expect(r.notes.value).toBe("note");
  });
});

describe("Quote additional rules", () => {
  it("customer and currency immutable via create", () => {
    const q = Quote.create({
      organizationId: orgId,
      customerId,
      currency: "eur",
    });
    expect(q.customerId).toBe(customerId);
    expect(q.currency.code).toBe("EUR");
  });

  it("requires customer", () => {
    expect(() =>
      Quote.create({
        organizationId: orgId,
        customerId: "" as never,
      }),
    ).toThrow(InvalidQuoteStateError);
  });

  it("setValidUntil only in draft", () => {
    const q = Quote.create({ organizationId: orgId, customerId });
    q.setValidUntil(new Date("2030-06-01"));
    expect(q.validUntil).not.toBeNull();
    q.setCurrentVersion("v" as never);
    q.issue();
    expect(() => q.setValidUntil(null)).toThrow(InvalidQuoteStateError);
  });

  it("line reconstitutes", () => {
    const line = QuoteLine.create({
      organizationId: orgId,
      quoteVersionId: "v1" as never,
      serviceId,
      description: "Snap",
      quantity: 1,
      unitPriceMinor: 50,
      currency: "USD",
    });
    const r = QuoteLine.reconstitute(line.toSnapshot());
    expect(r.lineTotal.minorUnits).toBe(50);
  });

  it("version reconstitutes", () => {
    const q = Quote.create({ organizationId: orgId, customerId });
    const v = QuoteVersion.create({
      organizationId: orgId,
      quoteId: q.id,
      versionNumber: 1,
      currency: "USD",
    });
    const r = QuoteVersion.reconstitute(v.toSnapshot());
    expect(r.versionNumber).toBe(1);
  });
});
