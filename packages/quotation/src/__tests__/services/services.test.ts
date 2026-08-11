import { describe, expect, it, beforeEach } from "vitest";
import { asCustomerId } from "@creative-lab/crm";
import { Organization, asOrganizationId } from "@creative-lab/organization";
import { asServiceId } from "@creative-lab/services";
import { ApprovalStatus } from "../../enums/ApprovalStatus.js";
import { QuoteStatus } from "../../enums/QuoteStatus.js";
import { QuoteVersionStatus } from "../../enums/QuoteVersionStatus.js";
import {
  DuplicateQuoteNumberError,
  QuoteExpiredError,
  QuoteNotFoundError,
} from "../../errors/QuotationErrors.js";
import {
  QuoteAccepted,
  QuoteCreated,
  QuoteDeclined,
  QuoteIssued,
  QuoteLineAdded,
  QuoteVersionCreated,
} from "../../events/quotation-events.js";
import { ApprovalService } from "../../services/ApprovalService.js";
import { LineService } from "../../services/LineService.js";
import { QuoteService } from "../../services/QuoteService.js";
import { VersionService } from "../../services/VersionService.js";
import {
  InMemoryEventPublisher,
  InMemoryOrganizationRepository,
  InMemoryQuoteApprovalRepository,
  InMemoryQuoteLineRepository,
  InMemoryQuoteRepository,
  InMemoryQuoteVersionRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const customerId = asCustomerId("cust-1");
const serviceId = asServiceId("svc-1");

describe("Quotation services", () => {
  let orgs: InMemoryOrganizationRepository;
  let quotes: InMemoryQuoteRepository;
  let versions: InMemoryQuoteVersionRepository;
  let lines: InMemoryQuoteLineRepository;
  let approvals: InMemoryQuoteApprovalRepository;
  let events: InMemoryEventPublisher;
  let quoteService: QuoteService;
  let versionService: VersionService;
  let lineService: LineService;
  let approvalService: ApprovalService;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    quotes = new InMemoryQuoteRepository();
    versions = new InMemoryQuoteVersionRepository();
    lines = new InMemoryQuoteLineRepository();
    approvals = new InMemoryQuoteApprovalRepository();
    events = new InMemoryEventPublisher();
    await orgs.save(
      Organization.create({ name: "Studio", slug: "studio", id: orgId }),
    );
    quoteService = new QuoteService({
      quoteRepository: quotes,
      quoteVersionRepository: versions,
      quoteLineRepository: lines,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    versionService = new VersionService({
      quoteVersionRepository: versions,
      quoteRepository: quotes,
      quoteLineRepository: lines,
      eventPublisher: events,
    });
    lineService = new LineService({
      quoteLineRepository: lines,
      quoteVersionRepository: versions,
      quoteRepository: quotes,
      eventPublisher: events,
    });
    approvalService = new ApprovalService({
      quoteApprovalRepository: approvals,
      quoteRepository: quotes,
      eventPublisher: events,
    });
  });

  async function createWithLine(number?: string) {
    const q = await quoteService.create({
      organizationId: orgId,
      customerId,
      quoteNumber: number,
      currency: "USD",
      validUntil: new Date("2030-01-01"),
    });
    const version = await versionService.getCurrent(q.id);
    await lineService.add({
      organizationId: orgId,
      quoteVersionId: version!.id,
      serviceId,
      description: "Production mix",
      quantity: 10,
      unitPriceMinor: 10000,
    });
    return quoteService.getById(q.id);
  }

  it("creates quote with version", async () => {
    const q = await quoteService.create({
      organizationId: orgId,
      customerId,
    });
    expect(q.status).toBe(QuoteStatus.DRAFT);
    expect(events.events.some((e) => e instanceof QuoteCreated)).toBe(true);
    expect(events.events.some((e) => e instanceof QuoteVersionCreated)).toBe(
      true,
    );
    expect(q.currentVersionId).not.toBeNull();
  });

  it("rejects duplicate quote number", async () => {
    await quoteService.create({
      organizationId: orgId,
      customerId,
      quoteNumber: "DUP-1",
    });
    await expect(
      quoteService.create({
        organizationId: orgId,
        customerId,
        quoteNumber: "DUP-1",
      }),
    ).rejects.toThrow(DuplicateQuoteNumberError);
  });

  it("adds lines and issues", async () => {
    const q = await createWithLine();
    expect(events.events.some((e) => e instanceof QuoteLineAdded)).toBe(true);
    const version = await versionService.getCurrent(q.id);
    expect(version?.total.minorUnits).toBe(100000);
    const issued = await quoteService.issue(q.id);
    expect(issued.isIssued).toBe(true);
    expect(events.events.some((e) => e instanceof QuoteIssued)).toBe(true);
    expect((await versionService.getById(version!.id)).locked).toBe(true);
  });

  it("cannot add line after issue", async () => {
    const q = await createWithLine("ISSUE-1");
    await quoteService.issue(q.id);
    const version = await versionService.getCurrent(q.id);
    await expect(
      lineService.add({
        organizationId: orgId,
        quoteVersionId: version!.id,
        serviceId,
        description: "Late",
        quantity: 1,
        unitPriceMinor: 100,
      }),
    ).rejects.toThrow();
  });

  it("accept and decline via approval service", async () => {
    const q = await createWithLine("ACC-1");
    await quoteService.issue(q.id);
    const approval = await approvalService.accept(q.id, "Looks good");
    expect(approval.status).toBe(ApprovalStatus.ACCEPTED);
    expect((await quoteService.getById(q.id)).isAccepted).toBe(true);
    expect(events.events.some((e) => e instanceof QuoteAccepted)).toBe(true);

    const q2 = await createWithLine("DEC-1");
    await quoteService.issue(q2.id);
    await approvalService.decline(q2.id, "Too expensive");
    expect((await quoteService.getById(q2.id)).status).toBe(
      QuoteStatus.DECLINED,
    );
    expect(events.events.some((e) => e instanceof QuoteDeclined)).toBe(true);
  });

  it("expire issued quote", async () => {
    const q = await createWithLine("EXP-1");
    await quoteService.issue(q.id);
    await quoteService.expire(q.id);
    expect((await quoteService.getById(q.id)).status).toBe(QuoteStatus.EXPIRED);
  });

  it("blocks accept when past validUntil", async () => {
    const q = await quoteService.create({
      organizationId: orgId,
      customerId,
      quoteNumber: "OLD",
      validUntil: new Date("2020-01-01"),
    });
    const version = await versionService.getCurrent(q.id);
    await lineService.add({
      organizationId: orgId,
      quoteVersionId: version!.id,
      serviceId,
      description: "X",
      quantity: 1,
      unitPriceMinor: 100,
    });
    await quoteService.issue(q.id);
    await expect(approvalService.accept(q.id)).rejects.toThrow(
      QuoteExpiredError,
    );
  });

  it("creates second version and supersedes first", async () => {
    const q = await createWithLine("VER-2");
    const v1 = await versionService.getCurrent(q.id);
    const v2 = await versionService.createVersion(q.id);
    expect(v2.versionNumber).toBe(2);
    expect(v2.status).toBe(QuoteVersionStatus.CURRENT);
    expect((await versionService.getById(v1!.id)).status).toBe(
      QuoteVersionStatus.SUPERSEDED,
    );
    expect((await quoteService.getById(q.id)).currentVersionId).toBe(v2.id);
  });

  it("removes line and recalculates", async () => {
    const q = await createWithLine("RM-1");
    const version = await versionService.getCurrent(q.id);
    const list = await lineService.listByVersion(version!.id);
    await lineService.remove(list[0]!.id);
    const updated = await versionService.getById(version!.id);
    expect(updated.total.minorUnits).toBe(0);
    expect(updated.lineIds.length).toBe(0);
  });

  it("update quantity replaces line", async () => {
    const q = await createWithLine("UQ-1");
    const version = await versionService.getCurrent(q.id);
    const list = await lineService.listByVersion(version!.id);
    await lineService.updateQuantity(list[0]!.id, 5, 2000);
    const updated = await versionService.getById(version!.id);
    expect(updated.total.minorUnits).toBe(10000);
  });

  it("archive quote", async () => {
    const q = await createWithLine("AR-1");
    await quoteService.archive(q.id);
    expect((await quoteService.getById(q.id)).isArchived).toBe(true);
  });

  it("list and find queries", async () => {
    const q = await createWithLine("FIND-1");
    expect((await quoteService.listByOrganization(orgId)).length).toBe(1);
    expect(
      (await quoteService.findByQuoteNumber(orgId, "FIND-1"))?.id,
    ).toBe(q.id);
  });

  it("not found", async () => {
    await expect(quoteService.getById("missing" as never)).rejects.toThrow(
      QuoteNotFoundError,
    );
  });

  it("cannot issue without lines", async () => {
    const q = await quoteService.create({
      organizationId: orgId,
      customerId,
      quoteNumber: "EMPTY",
    });
    await expect(quoteService.issue(q.id)).rejects.toThrow();
  });

  it("create pending approval then accept", async () => {
    const q = await createWithLine("PEND-1");
    await quoteService.issue(q.id);
    const pending = await approvalService.createPending({
      organizationId: orgId,
      quoteId: q.id,
    });
    expect(pending.isPending).toBe(true);
    await approvalService.accept(q.id);
    expect((await quoteService.getById(q.id)).isAccepted).toBe(true);
  });

  it("list versions and approvals", async () => {
    const q = await createWithLine("LIST-1");
    await versionService.createVersion(q.id);
    expect((await versionService.listByQuote(q.id)).length).toBe(2);
    const current = await versionService.getCurrent(q.id);
    await lineService.add({
      organizationId: orgId,
      quoteVersionId: current!.id,
      serviceId,
      description: "V2 line",
      quantity: 1,
      unitPriceMinor: 500,
    });
    await quoteService.issue(q.id);
    await approvalService.accept(q.id);
    expect((await approvalService.listByQuote(q.id)).length).toBe(1);
  });

  it("direct quote service accept decline after issue", async () => {
    const q = await createWithLine("DIR-A");
    await quoteService.issue(q.id);
    await quoteService.accept(q.id);
    expect((await quoteService.getById(q.id)).isAccepted).toBe(true);

    const q2 = await createWithLine("DIR-D");
    await quoteService.issue(q2.id);
    await quoteService.decline(q2.id);
    expect((await quoteService.getById(q2.id)).status).toBe(
      QuoteStatus.DECLINED,
    );
  });

  it("double accept via approval fails", async () => {
    const q = await createWithLine("DBL");
    await quoteService.issue(q.id);
    await approvalService.accept(q.id);
    await expect(approvalService.accept(q.id)).rejects.toThrow();
  });
});
