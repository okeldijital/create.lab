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
  ContractAmendmentError,
  ContractTermError,
  InvalidContractStateError,
  MandatoryTermRemovalError,
} from "../../errors/ContractErrors.js";
import { AmendmentPolicy } from "../../policies/AmendmentPolicy.js";
import { ContractLifecyclePolicy } from "../../policies/ContractLifecyclePolicy.js";
import { TermPolicy } from "../../policies/TermPolicy.js";
import { VersionPolicy } from "../../policies/VersionPolicy.js";

const orgId = asOrganizationId("org-1");
const customerId = asCustomerId("cust-1");
const quotationId = asQuoteId("q-1");

function contract() {
  return Contract.create({
    organizationId: orgId,
    customerId,
    quotationId,
    effectiveDate: new Date("2026-01-01"),
    expiryDate: new Date("2027-01-01"),
  });
}

describe("ContractLifecyclePolicy", () => {
  it("allows legal transitions", () => {
    const c = contract();
    ContractLifecyclePolicy.assertCanTransition(
      c,
      ContractStatus.PENDING_SIGNATURE,
    );
    c.markPendingSignature();
    ContractLifecyclePolicy.assertCanActivate(c);
  });

  it("blocks term edits after active", () => {
    const c = contract();
    c.setCurrentVersion("v" as never);
    c.markPendingSignature();
    c.activate();
    expect(() => ContractLifecyclePolicy.assertDraftOrPending(c)).toThrow(
      InvalidContractStateError,
    );
  });
});

describe("VersionPolicy", () => {
  it("sequential version numbers", () => {
    const c = contract();
    const v1 = ContractVersion.create({
      organizationId: orgId,
      contractId: c.id,
      versionNumber: 1,
    });
    expect(VersionPolicy.nextVersionNumber([v1])).toBe(2);
    expect(() => VersionPolicy.assertSequential(5, [v1])).toThrow(
      InvalidContractStateError,
    );
  });

  it("editable only when allowed", () => {
    const c = contract();
    const v = ContractVersion.create({
      organizationId: orgId,
      contractId: c.id,
      versionNumber: 1,
    });
    VersionPolicy.assertEditable(v, true);
    expect(() => VersionPolicy.assertEditable(v, false)).toThrow(
      InvalidContractStateError,
    );
  });
});

describe("TermPolicy", () => {
  it("unique order and mandatory protection", () => {
    const t1 = ContractTerm.create({
      organizationId: orgId,
      contractVersionId: "v1" as never,
      title: "A",
      description: "d",
      mandatory: true,
      order: 1,
    });
    TermPolicy.assertUniqueOrder(2, [t1]);
    expect(() => TermPolicy.assertUniqueOrder(1, [t1])).toThrow(
      ContractTermError,
    );
    expect(() => TermPolicy.assertCanRemove(t1)).toThrow(
      MandatoryTermRemovalError,
    );
  });

  it("requires terms for activation", () => {
    expect(() => TermPolicy.assertHasMandatoryWhenActivating([])).toThrow(
      ContractTermError,
    );
  });

  it("nextOrder", () => {
    const t = ContractTerm.create({
      organizationId: orgId,
      contractVersionId: "v" as never,
      title: "A",
      description: "d",
      order: 3,
    });
    expect(TermPolicy.nextOrder([t])).toBe(4);
  });
});

describe("AmendmentPolicy", () => {
  it("create only for active", () => {
    const c = contract();
    expect(() => AmendmentPolicy.assertCanCreate(c)).toThrow(
      ContractAmendmentError,
    );
    c.setCurrentVersion("v" as never);
    c.markPendingSignature();
    c.activate();
    AmendmentPolicy.assertCanCreate(c);
  });

  it("approve then apply", () => {
    const c = contract();
    c.setCurrentVersion("v" as never);
    c.markPendingSignature();
    c.activate();
    const a = ContractAmendment.create({
      organizationId: orgId,
      contractId: c.id,
      reason: "Adj",
      effectiveDate: new Date(),
    });
    AmendmentPolicy.assertCanApprove(a);
    expect(() => AmendmentPolicy.assertCanApply(a)).toThrow(
      ContractAmendmentError,
    );
    a.approve();
    AmendmentPolicy.assertCanApply(a);
  });

  it("applied amendment immutable", () => {
    const c = contract();
    c.setCurrentVersion("v" as never);
    c.markPendingSignature();
    c.activate();
    const a = ContractAmendment.create({
      organizationId: orgId,
      contractId: c.id,
      reason: "X",
      effectiveDate: new Date(),
    });
    a.approve();
    a.apply("v2" as never);
    expect(() => AmendmentPolicy.assertNotAppliedImmutable(a)).toThrow(
      ContractAmendmentError,
    );
  });
});

describe("ContractLifecyclePolicy extras", () => {
  it("blocks illegal archive transition from nothing weird", () => {
    const c = contract();
    ContractLifecyclePolicy.assertCanTransition(c, ContractStatus.ARCHIVED);
    c.archive();
    expect(() =>
      ContractLifecyclePolicy.assertCanTransition(c, ContractStatus.ACTIVE),
    ).toThrow(InvalidContractStateError);
  });
});

describe("VersionPolicy extras", () => {
  it("assertOneCurrent fails with two currents", () => {
    const c = contract();
    const v1 = ContractVersion.create({
      organizationId: orgId,
      contractId: c.id,
      versionNumber: 1,
    });
    const v2 = ContractVersion.create({
      organizationId: orgId,
      contractId: c.id,
      versionNumber: 2,
    });
    expect(() => VersionPolicy.assertOneCurrent([v1, v2])).toThrow(
      InvalidContractStateError,
    );
  });
});
