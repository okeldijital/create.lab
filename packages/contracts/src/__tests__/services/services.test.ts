import { describe, expect, it, beforeEach } from "vitest";
import { asCustomerId } from "@creative-lab/crm";
import { Organization, asOrganizationId } from "@creative-lab/organization";
import { asQuoteId } from "@creative-lab/quotation";
import { AmendmentStatus } from "../../enums/AmendmentStatus.js";
import { ContractStatus } from "../../enums/ContractStatus.js";
import { ContractVersionStatus } from "../../enums/ContractVersionStatus.js";
import {
  DuplicateContractNumberError,
  MandatoryTermRemovalError,
} from "../../errors/ContractErrors.js";
import {
  ContractActivated,
  ContractAmendmentApplied,
  ContractCreated,
  ContractTermAdded,
} from "../../events/contract-events.js";
import { AmendmentService } from "../../services/AmendmentService.js";
import { ContractService } from "../../services/ContractService.js";
import { TermService } from "../../services/TermService.js";
import { VersionService } from "../../services/VersionService.js";
import {
  InMemoryContractAmendmentRepository,
  InMemoryContractRepository,
  InMemoryContractTermRepository,
  InMemoryContractVersionRepository,
  InMemoryEventPublisher,
  InMemoryOrganizationRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const customerId = asCustomerId("cust-1");
const quotationId = asQuoteId("quote-1");

describe("Contract services", () => {
  let orgs: InMemoryOrganizationRepository;
  let contracts: InMemoryContractRepository;
  let versions: InMemoryContractVersionRepository;
  let terms: InMemoryContractTermRepository;
  let amendments: InMemoryContractAmendmentRepository;
  let events: InMemoryEventPublisher;
  let contractService: ContractService;
  let versionService: VersionService;
  let termService: TermService;
  let amendmentService: AmendmentService;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    contracts = new InMemoryContractRepository();
    versions = new InMemoryContractVersionRepository();
    terms = new InMemoryContractTermRepository();
    amendments = new InMemoryContractAmendmentRepository();
    events = new InMemoryEventPublisher();
    await orgs.save(
      Organization.create({ name: "Studio", slug: "studio", id: orgId }),
    );
    contractService = new ContractService({
      contractRepository: contracts,
      contractVersionRepository: versions,
      contractTermRepository: terms,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    versionService = new VersionService({
      contractVersionRepository: versions,
      contractRepository: contracts,
      contractTermRepository: terms,
      eventPublisher: events,
    });
    termService = new TermService({
      contractTermRepository: terms,
      contractVersionRepository: versions,
      contractRepository: contracts,
      eventPublisher: events,
    });
    amendmentService = new AmendmentService({
      contractAmendmentRepository: amendments,
      contractRepository: contracts,
      contractVersionRepository: versions,
      contractTermRepository: terms,
      eventPublisher: events,
    });
  });

  async function createActive(number = "CTR-SVC-1") {
    const c = await contractService.create({
      organizationId: orgId,
      customerId,
      quotationId,
      contractNumber: number,
      effectiveDate: new Date("2026-01-01"),
      expiryDate: new Date("2027-01-01"),
    });
    const v = await versionService.getCurrent(c.id);
    await termService.add({
      organizationId: orgId,
      contractVersionId: v!.id,
      title: "Scope",
      description: "Deliver work",
      mandatory: true,
    });
    await termService.add({
      organizationId: orgId,
      contractVersionId: v!.id,
      title: "Optional",
      description: "Nice to have",
      mandatory: false,
    });
    return contractService.activate(c.id);
  }

  it("creates contract with version", async () => {
    const c = await contractService.create({
      organizationId: orgId,
      customerId,
      quotationId,
      effectiveDate: new Date("2026-01-01"),
    });
    expect(c.status).toBe(ContractStatus.DRAFT);
    expect(events.events.some((e) => e instanceof ContractCreated)).toBe(true);
    expect(c.currentVersionId).not.toBeNull();
  });

  it("rejects duplicate contract number", async () => {
    await contractService.create({
      organizationId: orgId,
      customerId,
      quotationId,
      contractNumber: "DUP",
      effectiveDate: new Date(),
    });
    await expect(
      contractService.create({
        organizationId: orgId,
        customerId,
        quotationId,
        contractNumber: "DUP",
        effectiveDate: new Date(),
      }),
    ).rejects.toThrow(DuplicateContractNumberError);
  });

  it("adds terms and activates", async () => {
    const c = await createActive("ACT-1");
    expect(c.isActive).toBe(true);
    expect(events.events.some((e) => e instanceof ContractTermAdded)).toBe(
      true,
    );
    expect(events.events.some((e) => e instanceof ContractActivated)).toBe(
      true,
    );
    const v = await versionService.getCurrent(c.id);
    expect(v?.locked).toBe(true);
  });

  it("cannot remove mandatory term", async () => {
    const c = await contractService.create({
      organizationId: orgId,
      customerId,
      quotationId,
      contractNumber: "MAN",
      effectiveDate: new Date(),
    });
    const v = await versionService.getCurrent(c.id);
    const term = await termService.add({
      organizationId: orgId,
      contractVersionId: v!.id,
      title: "M",
      description: "D",
      mandatory: true,
    });
    await expect(termService.remove(term.id)).rejects.toThrow(
      MandatoryTermRemovalError,
    );
  });

  it("removes optional term", async () => {
    const c = await contractService.create({
      organizationId: orgId,
      customerId,
      quotationId,
      contractNumber: "OPT",
      effectiveDate: new Date(),
    });
    const v = await versionService.getCurrent(c.id);
    const term = await termService.add({
      organizationId: orgId,
      contractVersionId: v!.id,
      title: "O",
      description: "D",
      mandatory: false,
    });
    await termService.remove(term.id);
    expect((await termService.listByVersion(v!.id)).length).toBe(0);
  });

  it("reorders terms", async () => {
    const c = await contractService.create({
      organizationId: orgId,
      customerId,
      quotationId,
      contractNumber: "ORD",
      effectiveDate: new Date(),
    });
    const v = await versionService.getCurrent(c.id);
    const t1 = await termService.add({
      organizationId: orgId,
      contractVersionId: v!.id,
      title: "A",
      description: "d",
      order: 1,
    });
    const t2 = await termService.add({
      organizationId: orgId,
      contractVersionId: v!.id,
      title: "B",
      description: "d",
      order: 2,
    });
    const reordered = await termService.reorder(v!.id, [t2.id, t1.id]);
    const byId = new Map(reordered.map((t) => [t.id, t]));
    expect(byId.get(t2.id)?.order).toBe(1);
    expect(byId.get(t1.id)?.order).toBe(2);
  });

  it("terminate expire archive", async () => {
    const c = await createActive("TERM-1");
    await contractService.terminate(c.id);
    expect((await contractService.getById(c.id)).status).toBe(
      ContractStatus.TERMINATED,
    );

    const c2 = await createActive("EXP-1");
    await contractService.expire(c2.id);
    expect((await contractService.getById(c2.id)).status).toBe(
      ContractStatus.EXPIRED,
    );
    await contractService.archive(c2.id);
    expect((await contractService.getById(c2.id)).isArchived).toBe(true);
  });

  it("creates second draft version", async () => {
    const c = await contractService.create({
      organizationId: orgId,
      customerId,
      quotationId,
      contractNumber: "VER-2",
      effectiveDate: new Date(),
    });
    const v1 = await versionService.getCurrent(c.id);
    const v2 = await versionService.createVersion(c.id);
    expect(v2.versionNumber).toBe(2);
    expect((await versionService.getById(v1!.id)).status).toBe(
      ContractVersionStatus.SUPERSEDED,
    );
  });

  it("amendment approve and apply creates new version", async () => {
    const c = await createActive("AMD-1");
    const before = await versionService.getCurrent(c.id);
    const amendment = await amendmentService.create({
      organizationId: orgId,
      contractId: c.id,
      reason: "Add deliverable",
      effectiveDate: new Date("2026-06-01"),
    });
    await amendmentService.approve(amendment.id);
    const { version } = await amendmentService.apply(amendment.id);
    expect(version.versionNumber).toBe(2);
    expect(events.events.some((e) => e instanceof ContractAmendmentApplied)).toBe(
      true,
    );
    expect((await versionService.getById(before!.id)).status).toBe(
      ContractVersionStatus.SUPERSEDED,
    );
    const applied = await amendmentService.getById(amendment.id);
    expect(applied.status).toBe(AmendmentStatus.APPLIED);
    expect(applied.resultingVersionId).toBe(version.id);
    // terms cloned
    expect((await termService.listByVersion(version.id)).length).toBe(2);
  });

  it("list queries", async () => {
    const c = await createActive("FIND-1");
    expect((await contractService.listByOrganization(orgId)).length).toBe(1);
    expect(
      (await contractService.findByContractNumber(orgId, "FIND-1"))?.id,
    ).toBe(c.id);
    expect((await versionService.listByContract(c.id)).length).toBe(1);
    expect((await amendmentService.listByContract(c.id)).length).toBe(0);
  });

  it("cannot activate without terms", async () => {
    const c = await contractService.create({
      organizationId: orgId,
      customerId,
      quotationId,
      contractNumber: "EMPTY",
      effectiveDate: new Date(),
    });
    await expect(contractService.activate(c.id)).rejects.toThrow();
  });

  it("pending signature path", async () => {
    const c = await contractService.create({
      organizationId: orgId,
      customerId,
      quotationId,
      contractNumber: "PEND",
      effectiveDate: new Date(),
    });
    const v = await versionService.getCurrent(c.id);
    await termService.add({
      organizationId: orgId,
      contractVersionId: v!.id,
      title: "T",
      description: "D",
    });
    await contractService.markPendingSignature(c.id);
    expect((await contractService.getById(c.id)).status).toBe(
      ContractStatus.PENDING_SIGNATURE,
    );
    await contractService.activate(c.id);
    expect((await contractService.getById(c.id)).isActive).toBe(true);
  });

  it("cannot add term after activation", async () => {
    const c = await createActive("NOADD");
    const v = await versionService.getCurrent(c.id);
    await expect(
      termService.add({
        organizationId: orgId,
        contractVersionId: v!.id,
        title: "Late",
        description: "D",
      }),
    ).rejects.toThrow();
  });

  it("cannot create amendment on draft", async () => {
    const c = await contractService.create({
      organizationId: orgId,
      customerId,
      quotationId,
      contractNumber: "DRAFT-AMD",
      effectiveDate: new Date(),
    });
    await expect(
      amendmentService.create({
        organizationId: orgId,
        contractId: c.id,
        reason: "No",
        effectiveDate: new Date(),
      }),
    ).rejects.toThrow();
  });

  it("get version by id", async () => {
    const c = await contractService.create({
      organizationId: orgId,
      customerId,
      quotationId,
      contractNumber: "GETV",
      effectiveDate: new Date(),
    });
    const v = await versionService.getCurrent(c.id);
    expect((await versionService.getById(v!.id)).versionNumber).toBe(1);
  });

  it("find by quotation", async () => {
    await createActive("QREF");
    expect(
      (await contracts.findByQuotation(quotationId)).length,
    ).toBeGreaterThan(0);
  });
});
