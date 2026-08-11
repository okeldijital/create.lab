import { describe, expect, it } from "vitest";
import { asCustomerId } from "@creative-lab/crm";
import { asOrganizationId } from "@creative-lab/organization";
import { asServiceId } from "@creative-lab/services";
import { Quote } from "../../aggregates/Quote/Quote.js";
import { QuoteApproval } from "../../aggregates/QuoteApproval/QuoteApproval.js";
import { QuoteLine } from "../../aggregates/QuoteLine/QuoteLine.js";
import { QuoteVersion } from "../../aggregates/QuoteVersion/QuoteVersion.js";
import { QuoteStatus } from "../../enums/QuoteStatus.js";
import {
  InMemoryQuoteApprovalRepository,
  InMemoryQuoteLineRepository,
  InMemoryQuoteRepository,
  InMemoryQuoteVersionRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const customerId = asCustomerId("cust-1");
const serviceId = asServiceId("svc-1");

describe("Repository contracts", () => {
  it("QuoteRepository ports", async () => {
    const repo = new InMemoryQuoteRepository();
    const q = Quote.create({
      organizationId: orgId,
      customerId,
      quoteNumber: "REPO-Q-1",
    });
    await repo.save(q);
    expect(await repo.exists(q.id)).toBe(true);
    expect((await repo.findByOrganization(orgId))[0]?.id).toBe(q.id);
    expect((await repo.findByCustomer(customerId))[0]?.id).toBe(q.id);
    expect((await repo.findByQuoteNumber(orgId, "REPO-Q-1"))?.id).toBe(q.id);
    expect((await repo.findByStatus(QuoteStatus.DRAFT)).length).toBe(1);
    await repo.archive(q.id);
  });

  it("Version Line Approval ports", async () => {
    const q = Quote.create({ organizationId: orgId, customerId });
    const vRepo = new InMemoryQuoteVersionRepository();
    const v = QuoteVersion.create({
      organizationId: orgId,
      quoteId: q.id,
      versionNumber: 1,
      currency: "USD",
    });
    await vRepo.save(v);
    expect((await vRepo.findCurrentVersion(q.id))?.id).toBe(v.id);
    expect((await vRepo.findByQuote(q.id)).length).toBe(1);

    const lRepo = new InMemoryQuoteLineRepository();
    const line = QuoteLine.create({
      organizationId: orgId,
      quoteVersionId: v.id,
      serviceId,
      description: "L",
      quantity: 1,
      unitPriceMinor: 100,
      currency: "USD",
    });
    await lRepo.save(line);
    expect((await lRepo.findByVersion(v.id)).length).toBe(1);
    await lRepo.delete(line.id);
    expect((await lRepo.findByVersion(v.id)).length).toBe(0);

    const aRepo = new InMemoryQuoteApprovalRepository();
    const a = QuoteApproval.create({
      organizationId: orgId,
      quoteId: q.id,
    });
    await aRepo.save(a);
    expect((await aRepo.findByQuote(q.id)).length).toBe(1);
    a.accept();
    await aRepo.update(a);
    expect((await aRepo.findById(a.id))?.isTerminal).toBe(true);
    expect(await lRepo.exists(line.id)).toBe(false);
    expect(await vRepo.exists(v.id)).toBe(true);
  });

  it("version findById after save", async () => {
    const q = Quote.create({ organizationId: orgId, customerId });
    const vRepo = new InMemoryQuoteVersionRepository();
    const v = QuoteVersion.create({
      organizationId: orgId,
      quoteId: q.id,
      versionNumber: 1,
      currency: "USD",
    });
    await vRepo.save(v);
    expect((await vRepo.findById(v.id))?.versionNumber).toBe(1);
  });
});
