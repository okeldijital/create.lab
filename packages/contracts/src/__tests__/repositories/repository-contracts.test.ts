import { describe, expect, it } from "vitest";
import { asCustomerId } from "@creative-lab/crm";
import { asOrganizationId } from "@creative-lab/organization";
import { asQuoteId } from "@creative-lab/quotation";
import { Contract } from "../../aggregates/Contract/Contract.js";
import { ContractAmendment } from "../../aggregates/ContractAmendment/ContractAmendment.js";
import { ContractTerm } from "../../aggregates/ContractTerm/ContractTerm.js";
import { ContractVersion } from "../../aggregates/ContractVersion/ContractVersion.js";
import { ContractStatus } from "../../enums/ContractStatus.js";
import {
  InMemoryContractAmendmentRepository,
  InMemoryContractRepository,
  InMemoryContractTermRepository,
  InMemoryContractVersionRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");
const customerId = asCustomerId("cust-1");
const quotationId = asQuoteId("q-1");

describe("Repository contracts", () => {
  it("ContractRepository ports", async () => {
    const repo = new InMemoryContractRepository();
    const c = Contract.create({
      organizationId: orgId,
      customerId,
      quotationId,
      contractNumber: "REPO-1",
      effectiveDate: new Date("2026-01-01"),
    });
    await repo.save(c);
    expect(await repo.exists(c.id)).toBe(true);
    expect((await repo.findByOrganization(orgId))[0]?.id).toBe(c.id);
    expect((await repo.findByCustomer(customerId))[0]?.id).toBe(c.id);
    expect((await repo.findByQuotation(quotationId))[0]?.id).toBe(c.id);
    expect((await repo.findByContractNumber(orgId, "REPO-1"))?.id).toBe(c.id);
    expect((await repo.findByStatus(ContractStatus.DRAFT)).length).toBe(1);
    await repo.archive(c.id);
  });

  it("Version Term Amendment ports", async () => {
    const c = Contract.create({
      organizationId: orgId,
      customerId,
      quotationId,
      effectiveDate: new Date(),
    });
    const vRepo = new InMemoryContractVersionRepository();
    const v = ContractVersion.create({
      organizationId: orgId,
      contractId: c.id,
      versionNumber: 1,
    });
    await vRepo.save(v);
    expect((await vRepo.findCurrentVersion(c.id))?.id).toBe(v.id);
    expect((await vRepo.findByContract(c.id)).length).toBe(1);

    const tRepo = new InMemoryContractTermRepository();
    const term = ContractTerm.create({
      organizationId: orgId,
      contractVersionId: v.id,
      title: "T",
      description: "D",
      order: 1,
    });
    await tRepo.save(term);
    expect((await tRepo.findByVersion(v.id)).length).toBe(1);
    await tRepo.delete(term.id);
    expect((await tRepo.findByVersion(v.id)).length).toBe(0);

    const aRepo = new InMemoryContractAmendmentRepository();
    const a = ContractAmendment.create({
      organizationId: orgId,
      contractId: c.id,
      reason: "R",
      effectiveDate: new Date(),
    });
    await aRepo.save(a);
    expect((await aRepo.findByContract(c.id)).length).toBe(1);
    a.approve();
    await aRepo.update(a);
    expect((await aRepo.findById(a.id))?.status).toBe("APPROVED");
  });

  it("version exists", async () => {
    const c = Contract.create({
      organizationId: orgId,
      customerId,
      quotationId,
      effectiveDate: new Date(),
    });
    const vRepo = new InMemoryContractVersionRepository();
    const v = ContractVersion.create({
      organizationId: orgId,
      contractId: c.id,
      versionNumber: 1,
    });
    await vRepo.save(v);
    expect(await vRepo.exists(v.id)).toBe(true);
  });

  it("term and amendment exists", async () => {
    const c = Contract.create({
      organizationId: orgId,
      customerId,
      quotationId,
      effectiveDate: new Date(),
    });
    const v = ContractVersion.create({
      organizationId: orgId,
      contractId: c.id,
      versionNumber: 1,
    });
    const tRepo = new InMemoryContractTermRepository();
    const term = ContractTerm.create({
      organizationId: orgId,
      contractVersionId: v.id,
      title: "T",
      description: "D",
      order: 1,
    });
    await tRepo.save(term);
    expect(await tRepo.exists(term.id)).toBe(true);
    const aRepo = new InMemoryContractAmendmentRepository();
    const a = ContractAmendment.create({
      organizationId: orgId,
      contractId: c.id,
      reason: "R",
      effectiveDate: new Date(),
    });
    await aRepo.save(a);
    expect(await aRepo.exists(a.id)).toBe(true);
  });
});
