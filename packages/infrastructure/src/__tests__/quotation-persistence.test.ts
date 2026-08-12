import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  Quote,
  QuoteApproval,
  QuoteLine,
  QuoteVersion,
  asQuoteApprovalId,
  asQuoteId,
  asQuoteLineId,
  asQuoteVersionId,
} from "@creative-lab/quotation";
import type { OrganizationId } from "@creative-lab/organization";
import type { CustomerId, OpportunityId } from "@creative-lab/crm";
import type { ServiceId } from "@creative-lab/services";
import {
  QuoteApprovalMapper,
  QuoteLineMapper,
  QuoteMapper,
  QuoteVersionMapper,
} from "../persistence/quotation/mappers.js";

const createId = (): string => randomUUID();
const organizationId = createId() as OrganizationId;
const customerId = createId() as CustomerId;
const opportunityId = createId() as OpportunityId;
const serviceId = createId() as ServiceId;
const now = new Date("2026-01-01T00:00:00.000Z");

const quote = Quote.create({
  id: createId(),
  organizationId,
  customerId,
  opportunityId,
  quoteNumber: "QT-2026-0001",
  currency: "ZAR",
  validUntil: new Date("2026-02-01T00:00:00.000Z"),
  now,
});

const version = QuoteVersion.create({
  id: createId(),
  organizationId,
  quoteId: quote.id,
  versionNumber: 1,
  currency: "ZAR",
  discountMinor: 5000,
  now,
});

const line = QuoteLine.create({
  id: createId(),
  organizationId,
  quoteVersionId: version.id,
  serviceId,
  description: "Production service",
  quantity: 1.5,
  unitPriceMinor: 300000,
  currency: "ZAR",
  now,
});

const approval = QuoteApproval.create({
  id: createId(),
  organizationId,
  quoteId: quote.id,
  notes: "Customer review pending",
  now,
});

void asQuoteApprovalId;
void asQuoteId;
void asQuoteLineId;
void asQuoteVersionId;

// The explicit branded casts above are intentionally kept available to this
// test file for future repository fixtures; mapper round-trips remain the
// assertions under test.

describe("Quotation persistence mappers", () => {
  it("round-trips Quote", () => {
    const restored = QuoteMapper.fromRow(QuoteMapper.toRow(quote));
    expect(restored.toSnapshot()).toEqual(quote.toSnapshot());
  });

  it("round-trips QuoteVersion and preserves monetary totals", () => {
    const restored = QuoteVersionMapper.fromRow(QuoteVersionMapper.toRow(version));
    expect(restored.toSnapshot()).toEqual(version.toSnapshot());
    expect(restored.discount.minorUnits).toBe(5000);
  });

  it("round-trips QuoteLine and preserves decimal quantity", () => {
    const restored = QuoteLineMapper.fromRow(QuoteLineMapper.toRow(line));
    expect(restored.toSnapshot()).toEqual(line.toSnapshot());
    expect(restored.quantity.value).toBe(1.5);
    expect(restored.lineTotal.minorUnits).toBe(450000);
  });

  it("round-trips QuoteApproval", () => {
    const restored = QuoteApprovalMapper.fromRow(QuoteApprovalMapper.toRow(approval));
    expect(restored.toSnapshot()).toEqual(approval.toSnapshot());
  });
});
