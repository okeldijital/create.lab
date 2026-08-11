import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { asOrganizationId } from "@creative-lab/organization";
import { ApprovalStatus } from "../../enums/ApprovalStatus.js";
import { QuoteStatus } from "../../enums/QuoteStatus.js";
import {
  QuoteAccepted,
  QuoteApprovalRecorded,
  QuoteArchived,
  QuoteCreated,
  QuoteDeclined,
  QuoteExpired,
  QuoteIssued,
  QuoteLineAdded,
  QuoteLineRemoved,
  QuoteVersionCreated,
  QuoteVersionPromoted,
} from "../../events/quotation-events.js";
import {
  asQuoteApprovalId,
  asQuoteId,
  asQuoteLineId,
  asQuoteVersionId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const quoteId = asQuoteId("q1");

describe("Domain events", () => {
  it("QuoteCreated frozen and versioned", () => {
    const e = QuoteCreated.create({
      organizationId: orgId,
      quoteId,
      quoteNumber: "Q-1",
      customerId: "c1",
      status: QuoteStatus.DRAFT,
    });
    expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(Object.isFrozen(e)).toBe(true);
    expect(Object.isFrozen(e.payload)).toBe(true);
    expect(e.payload.quoteNumber).toBe("Q-1");
  });

  it("covers quotation event set", () => {
    const events = [
      QuoteIssued.create({
        organizationId: orgId,
        quoteId,
        versionId: asQuoteVersionId("v1"),
      }),
      QuoteAccepted.create({ organizationId: orgId, quoteId }),
      QuoteDeclined.create({ organizationId: orgId, quoteId }),
      QuoteExpired.create({ organizationId: orgId, quoteId }),
      QuoteArchived.create({ organizationId: orgId, quoteId }),
      QuoteVersionCreated.create({
        organizationId: orgId,
        versionId: asQuoteVersionId("v1"),
        quoteId,
        versionNumber: 1,
      }),
      QuoteVersionPromoted.create({
        organizationId: orgId,
        versionId: asQuoteVersionId("v2"),
        quoteId,
        previousVersionId: asQuoteVersionId("v1"),
      }),
      QuoteLineAdded.create({
        organizationId: orgId,
        lineId: asQuoteLineId("l1"),
        versionId: asQuoteVersionId("v1"),
        serviceId: "s1",
      }),
      QuoteLineRemoved.create({
        organizationId: orgId,
        lineId: asQuoteLineId("l1"),
        versionId: asQuoteVersionId("v1"),
      }),
      QuoteApprovalRecorded.create({
        organizationId: orgId,
        approvalId: asQuoteApprovalId("a1"),
        quoteId,
        decision: ApprovalStatus.ACCEPTED,
      }),
    ];
    for (const e of events) {
      expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
      expect(Object.isFrozen(e)).toBe(true);
      expect(Object.isFrozen(e.payload)).toBe(true);
    }
  });

  it("QuoteIssued payload has versionId", () => {
    const e = QuoteIssued.create({
      organizationId: orgId,
      quoteId,
      versionId: asQuoteVersionId("vx"),
    });
    expect(e.payload.versionId).toBe("vx");
    expect(e.eventType).toBe("QuoteIssued");
  });

  it("QuoteLineAdded payload has serviceId", () => {
    const e = QuoteLineAdded.create({
      organizationId: orgId,
      lineId: asQuoteLineId("lx"),
      versionId: asQuoteVersionId("vx"),
      serviceId: "svc-x",
    });
    expect(e.payload.serviceId).toBe("svc-x");
  });
});
