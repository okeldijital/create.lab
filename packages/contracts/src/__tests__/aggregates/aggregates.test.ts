import { describe, expect, it } from "vitest";
import { asCustomerId } from "@creative-lab/crm";
import { asOrganizationId } from "@creative-lab/organization";
import { asQuoteId } from "@creative-lab/quotation";
import { Contract } from "../../aggregates/Contract/Contract.js";
import { ContractAmendment } from "../../aggregates/ContractAmendment/ContractAmendment.js";
import { ContractTerm } from "../../aggregates/ContractTerm/ContractTerm.js";
import { ContractVersion } from "../../aggregates/ContractVersion/ContractVersion.js";
import { AmendmentStatus } from "../../enums/AmendmentStatus.js";
import { ContractStatus } from "../../enums/ContractStatus.js";
import { ContractVersionStatus } from "../../enums/ContractVersionStatus.js";
import {
  ContractAlreadyActiveError,
  ContractAmendmentError,
  ContractTermError,
  InvalidContractStateError,
} from "../../errors/ContractErrors.js";
import {
  ContractActivated,
  ContractCreated,
  ContractVersionCreated,
} from "../../events/contract-events.js";

const orgId = asOrganizationId("org-1");
const customerId = asCustomerId("cust-1");
const quotationId = asQuoteId("quote-1");

function createContract(
  overrides: Partial<Parameters<typeof Contract.create>[0]> = {},
) {
  return Contract.create({
    organizationId: orgId,
    customerId,
    quotationId,
    contractNumber: "CTR-001",
    effectiveDate: new Date("2026-01-01"),
    expiryDate: new Date("2027-01-01"),
    ...overrides,
  });
}

describe("Contract aggregate", () => {
  it("creates DRAFT with event", () => {
    const c = createContract();
    expect(c.status).toBe(ContractStatus.DRAFT);
    expect(c.contractNumber.value).toBe("CTR-001");
    expect(c.pullDomainEvents()[0]).toBeInstanceOf(ContractCreated);
  });

  it("lifecycle pending → active → expire/terminate → archive", () => {
    const c = createContract();
    c.pullDomainEvents();
    c.setCurrentVersion("v1" as never);
    c.markPendingSignature();
    expect(c.status).toBe(ContractStatus.PENDING_SIGNATURE);
    c.activate();
    expect(c.isActive).toBe(true);
    expect(c.pullDomainEvents().some((e) => e instanceof ContractActivated)).toBe(
      true,
    );

    const c2 = createContract({ contractNumber: "CTR-002" });
    c2.setCurrentVersion("v1" as never);
    c2.markPendingSignature();
    c2.activate();
    c2.expire();
    expect(c2.status).toBe(ContractStatus.EXPIRED);
    c2.archive();
    expect(c2.isArchived).toBe(true);

    const c3 = createContract({ contractNumber: "CTR-003" });
    c3.setCurrentVersion("v1" as never);
    c3.markPendingSignature();
    c3.activate();
    c3.terminate();
    expect(c3.status).toBe(ContractStatus.TERMINATED);
  });

  it("cannot activate twice or without version", () => {
    const c = createContract({ contractNumber: "CTR-004" });
    expect(() => c.activate()).toThrow(InvalidContractStateError);
    c.setCurrentVersion("v1" as never);
    c.markPendingSignature();
    c.activate();
    expect(() => c.activate()).toThrow(ContractAlreadyActiveError);
  });

  it("requires customer and quotation", () => {
    expect(() =>
      Contract.create({
        organizationId: orgId,
        customerId: "" as never,
        quotationId,
        effectiveDate: new Date(),
      }),
    ).toThrow(InvalidContractStateError);
  });

  it("reconstitutes", () => {
    const c = createContract({ contractNumber: "SNAP" });
    const r = Contract.reconstitute(c.toSnapshot());
    expect(r.contractNumber.value).toBe("SNAP");
  });

  it("archived immutable", () => {
    const c = createContract({ contractNumber: "ARCH" });
    c.archive();
    expect(() => c.markPendingSignature()).toThrow(InvalidContractStateError);
  });
});

describe("ContractVersion aggregate", () => {
  it("creates CURRENT", () => {
    const c = createContract();
    const v = ContractVersion.create({
      organizationId: orgId,
      contractId: c.id,
      versionNumber: 1,
    });
    expect(v.status).toBe(ContractVersionStatus.CURRENT);
    expect(v.pullDomainEvents()[0]).toBeInstanceOf(ContractVersionCreated);
  });

  it("lock supersede promote", () => {
    const c = createContract();
    const v1 = ContractVersion.create({
      organizationId: orgId,
      contractId: c.id,
      versionNumber: 1,
    });
    v1.pullDomainEvents();
    v1.addTermId("t1" as never);
    v1.lock();
    expect(() => v1.addTermId("t2" as never)).toThrow(InvalidContractStateError);
    v1.supersede();
    expect(v1.status).toBe(ContractVersionStatus.SUPERSEDED);
    const v2 = ContractVersion.create({
      organizationId: orgId,
      contractId: c.id,
      versionNumber: 2,
    });
    v2.pullDomainEvents();
    v2.promote(v1.id);
    expect(v2.isCurrent).toBe(true);
  });

  it("reconstitutes", () => {
    const c = createContract();
    const v = ContractVersion.create({
      organizationId: orgId,
      contractId: c.id,
      versionNumber: 1,
    });
    expect(ContractVersion.reconstitute(v.toSnapshot()).versionNumber).toBe(1);
  });
});

describe("ContractTerm aggregate", () => {
  it("creates with order and mandatory", () => {
    const term = ContractTerm.create({
      organizationId: orgId,
      contractVersionId: "v1" as never,
      title: "Payment",
      description: "Net 30",
      mandatory: true,
      order: 1,
    });
    expect(term.mandatory).toBe(true);
    expect(term.order).toBe(1);
  });

  it("rejects bad order", () => {
    expect(() =>
      ContractTerm.create({
        organizationId: orgId,
        contractVersionId: "v1" as never,
        title: "X",
        description: "Y",
        order: 0,
      }),
    ).toThrow(ContractTermError);
  });

  it("setOrder and reconstitute", () => {
    const term = ContractTerm.create({
      organizationId: orgId,
      contractVersionId: "v1" as never,
      title: "X",
      description: "Y",
      order: 1,
    });
    term.setOrder(3);
    expect(term.order).toBe(3);
    expect(ContractTerm.reconstitute(term.toSnapshot()).title.value).toBe("X");
  });
});

describe("ContractAmendment aggregate", () => {
  it("DRAFT → APPROVED → APPLIED", () => {
    const c = createContract();
    const a = ContractAmendment.create({
      organizationId: orgId,
      contractId: c.id,
      reason: "Scope change",
      effectiveDate: new Date("2026-06-01"),
    });
    expect(a.status).toBe(AmendmentStatus.DRAFT);
    a.approve();
    expect(a.status).toBe(AmendmentStatus.APPROVED);
    a.apply("v2" as never);
    expect(a.isApplied).toBe(true);
    expect(a.resultingVersionId).toBe("v2");
  });

  it("cannot apply without approve", () => {
    const c = createContract();
    const a = ContractAmendment.create({
      organizationId: orgId,
      contractId: c.id,
      reason: "X",
      effectiveDate: new Date(),
    });
    expect(() => a.apply("v2" as never)).toThrow(ContractAmendmentError);
  });

  it("reconstitutes", () => {
    const c = createContract();
    const a = ContractAmendment.create({
      organizationId: orgId,
      contractId: c.id,
      reason: "R",
      effectiveDate: new Date("2026-03-01"),
    });
    expect(
      ContractAmendment.reconstitute(a.toSnapshot()).reason.value,
    ).toBe("R");
  });

  it("cannot approve applied amendment again", () => {
    const c = createContract();
    const a = ContractAmendment.create({
      organizationId: orgId,
      contractId: c.id,
      reason: "X",
      effectiveDate: new Date(),
    });
    a.approve();
    a.apply("v2" as never);
    expect(() => a.approve()).toThrow(ContractAmendmentError);
  });
});

describe("Contract extras", () => {
  it("isPastExpiry respects period", () => {
    const c = createContract({
      contractNumber: "EXP-CHK",
      effectiveDate: new Date("2019-01-01"),
      expiryDate: new Date("2020-01-01"),
    });
    expect(c.isPastExpiry(new Date("2021-01-01"))).toBe(true);
  });

  it("generates contract number", () => {
    const c = Contract.create({
      organizationId: orgId,
      customerId,
      quotationId,
      effectiveDate: new Date("2026-01-01"),
    });
    expect(c.contractNumber.value.startsWith("CTR-")).toBe(true);
  });

  it("customer and quotation immutable", () => {
    const c = createContract();
    expect(c.customerId).toBe(customerId);
    expect(c.quotationId).toBe(quotationId);
  });

  it("version setTermIds", () => {
    const c = createContract();
    const v = ContractVersion.create({
      organizationId: orgId,
      contractId: c.id,
      versionNumber: 1,
    });
    v.setTermIds(["t1" as never, "t2" as never]);
    expect(v.termIds.length).toBe(2);
  });

  it("term non-mandatory default", () => {
    const term = ContractTerm.create({
      organizationId: orgId,
      contractVersionId: "v" as never,
      title: "Opt",
      description: "D",
      order: 1,
    });
    expect(term.mandatory).toBe(false);
  });
});
