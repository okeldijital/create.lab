import { describe, expect, it } from "vitest";
import { asCustomerId } from "@creative-lab/crm";
import { asOrganizationId } from "@creative-lab/organization";
import { Quote } from "../../aggregates/Quote/Quote.js";
import { QuoteApproval } from "../../aggregates/QuoteApproval/QuoteApproval.js";
import { QuoteVersion } from "../../aggregates/QuoteVersion/QuoteVersion.js";
import {
  InvalidQuoteStateError,
  QuoteExpiredError,
  QuotationValidationError,
} from "../../errors/QuotationErrors.js";
import { ApprovalPolicy } from "../../policies/ApprovalPolicy.js";
import { PricingPolicy } from "../../policies/PricingPolicy.js";
import { QuoteLifecyclePolicy } from "../../policies/QuoteLifecyclePolicy.js";
import { VersionPolicy } from "../../policies/VersionPolicy.js";

const orgId = asOrganizationId("org-1");
const customerId = asCustomerId("cust-1");

describe("PricingPolicy", () => {
  it("computes line and version totals", () => {
    const line = PricingPolicy.computeLineTotal({
      quantity: 2,
      unitPriceMinor: 1500,
      currency: "USD",
    });
    expect(line.lineTotal.minorUnits).toBe(3000);
    const totals = PricingPolicy.computeVersionTotals(
      [
        { quantity: 2, unitPriceMinor: 1500, currency: "USD" },
        { quantity: 1, unitPriceMinor: 500, currency: "USD" },
      ],
      200,
      "USD",
    );
    expect(totals.subtotal.minorUnits).toBe(3500);
    expect(totals.total.minorUnits).toBe(3300);
  });

  it("rejects discount over subtotal", () => {
    expect(() =>
      PricingPolicy.computeVersionTotals(
        [{ quantity: 1, unitPriceMinor: 100, currency: "USD" }],
        200,
        "USD",
      ),
    ).toThrow(QuotationValidationError);
  });
});

describe("QuoteLifecyclePolicy", () => {
  it("draft only for structural edits", () => {
    const q = Quote.create({ organizationId: orgId, customerId });
    QuoteLifecyclePolicy.assertDraft(q);
    q.setCurrentVersion("v" as never);
    q.issue();
    expect(() => QuoteLifecyclePolicy.assertDraft(q)).toThrow(
      InvalidQuoteStateError,
    );
  });

  it("accept blocked when expired", () => {
    const q = Quote.create({
      organizationId: orgId,
      customerId,
      validUntil: new Date("2020-01-01"),
    });
    q.setCurrentVersion("v" as never);
    q.issue();
    expect(() =>
      QuoteLifecyclePolicy.assertCanAccept(q, new Date("2021-01-01")),
    ).toThrow(QuoteExpiredError);
  });
});

describe("VersionPolicy", () => {
  it("sequential numbers", () => {
    const q = Quote.create({ organizationId: orgId, customerId });
    const v1 = QuoteVersion.create({
      organizationId: orgId,
      quoteId: q.id,
      versionNumber: 1,
      currency: "USD",
    });
    expect(VersionPolicy.nextVersionNumber([v1])).toBe(2);
    expect(() => VersionPolicy.assertSequential(3, [v1])).toThrow(
      InvalidQuoteStateError,
    );
  });

  it("editable only when draft", () => {
    const q = Quote.create({ organizationId: orgId, customerId });
    const v = QuoteVersion.create({
      organizationId: orgId,
      quoteId: q.id,
      versionNumber: 1,
      currency: "USD",
    });
    VersionPolicy.assertEditable(v, true);
    expect(() => VersionPolicy.assertEditable(v, false)).toThrow(
      InvalidQuoteStateError,
    );
  });
});

describe("ApprovalPolicy", () => {
  it("requires issued quote and one decision", () => {
    const q = Quote.create({ organizationId: orgId, customerId });
    expect(() =>
      ApprovalPolicy.assertCanRecordDecision(q, []),
    ).toThrow();
    q.setCurrentVersion("v" as never);
    q.issue();
    ApprovalPolicy.assertCanRecordDecision(q, []);
    const a = QuoteApproval.create({
      organizationId: orgId,
      quoteId: q.id,
    });
    a.accept();
    expect(() => ApprovalPolicy.assertCanRecordDecision(q, [a])).toThrow();
  });

  it("assertPending rejects terminal", () => {
    const q = Quote.create({ organizationId: orgId, customerId });
    const a = QuoteApproval.create({
      organizationId: orgId,
      quoteId: q.id,
    });
    a.decline();
    expect(() => ApprovalPolicy.assertPending(a)).toThrow();
  });
});

describe("PricingPolicy extra", () => {
  it("currency mismatch on version totals", () => {
    expect(() =>
      PricingPolicy.computeVersionTotals(
        [{ quantity: 1, unitPriceMinor: 100, currency: "EUR" }],
        0,
        "USD",
      ),
    ).toThrow(QuotationValidationError);
  });
});
