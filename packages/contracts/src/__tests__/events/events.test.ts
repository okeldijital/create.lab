import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { asOrganizationId } from "@creative-lab/organization";
import { AmendmentStatus } from "../../enums/AmendmentStatus.js";
import { ContractStatus } from "../../enums/ContractStatus.js";
import {
  ContractActivated,
  ContractAmendmentApplied,
  ContractAmendmentApproved,
  ContractAmendmentCreated,
  ContractArchived,
  ContractCreated,
  ContractExpired,
  ContractTermAdded,
  ContractTermRemoved,
  ContractTerminated,
  ContractVersionCreated,
  ContractVersionPromoted,
} from "../../events/contract-events.js";
import {
  asContractAmendmentId,
  asContractId,
  asContractTermId,
  asContractVersionId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const contractId = asContractId("c1");

describe("Domain events", () => {
  it("ContractCreated frozen versioned", () => {
    const e = ContractCreated.create({
      organizationId: orgId,
      contractId,
      contractNumber: "CTR-1",
      customerId: "cust",
      quotationId: "q",
      status: ContractStatus.DRAFT,
    });
    expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(Object.isFrozen(e)).toBe(true);
    expect(Object.isFrozen(e.payload)).toBe(true);
    expect(e.payload.contractNumber).toBe("CTR-1");
  });

  it("covers contract event set", () => {
    const events = [
      ContractActivated.create({ organizationId: orgId, contractId }),
      ContractExpired.create({ organizationId: orgId, contractId }),
      ContractTerminated.create({ organizationId: orgId, contractId }),
      ContractArchived.create({ organizationId: orgId, contractId }),
      ContractVersionCreated.create({
        organizationId: orgId,
        versionId: asContractVersionId("v1"),
        contractId,
        versionNumber: 1,
      }),
      ContractVersionPromoted.create({
        organizationId: orgId,
        versionId: asContractVersionId("v2"),
        contractId,
        previousVersionId: asContractVersionId("v1"),
      }),
      ContractTermAdded.create({
        organizationId: orgId,
        termId: asContractTermId("t1"),
        versionId: asContractVersionId("v1"),
        title: "Scope",
        order: 1,
      }),
      ContractTermRemoved.create({
        organizationId: orgId,
        termId: asContractTermId("t1"),
        versionId: asContractVersionId("v1"),
      }),
      ContractAmendmentCreated.create({
        organizationId: orgId,
        amendmentId: asContractAmendmentId("a1"),
        contractId,
        status: AmendmentStatus.DRAFT,
      }),
      ContractAmendmentApproved.create({
        organizationId: orgId,
        amendmentId: asContractAmendmentId("a1"),
        contractId,
      }),
      ContractAmendmentApplied.create({
        organizationId: orgId,
        amendmentId: asContractAmendmentId("a1"),
        contractId,
        newVersionId: asContractVersionId("v2"),
      }),
    ];
    for (const e of events) {
      expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
      expect(Object.isFrozen(e)).toBe(true);
      expect(Object.isFrozen(e.payload)).toBe(true);
    }
  });

  it("amendment applied payload", () => {
    const e = ContractAmendmentApplied.create({
      organizationId: orgId,
      amendmentId: asContractAmendmentId("a1"),
      contractId,
      newVersionId: asContractVersionId("v9"),
    });
    expect(e.payload.newVersionId).toBe("v9");
  });

  it("term added payload order", () => {
    const e = ContractTermAdded.create({
      organizationId: orgId,
      termId: asContractTermId("t9"),
      versionId: asContractVersionId("v1"),
      title: "Pay",
      order: 5,
    });
    expect(e.payload.order).toBe(5);
    expect(e.eventType).toBe("ContractTermAdded");
  });

  it("version promoted previous", () => {
    const e = ContractVersionPromoted.create({
      organizationId: orgId,
      versionId: asContractVersionId("v2"),
      contractId,
      previousVersionId: asContractVersionId("v1"),
    });
    expect(e.payload.previousVersionId).toBe("v1");
  });
});
