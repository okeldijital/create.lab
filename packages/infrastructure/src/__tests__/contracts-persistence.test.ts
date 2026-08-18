import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { Contract, ContractAmendment, ContractTerm, ContractVersion } from "@creative-lab/contracts";
import type { OrganizationId } from "@creative-lab/organization";
import type { CustomerId } from "@creative-lab/crm";
import type { QuoteId } from "@creative-lab/quotation";
import {
  ContractAmendmentMapper,
  ContractMapper,
  ContractTermMapper,
  ContractVersionMapper,
} from "../persistence/contracts/mappers.js";

const id = (): string => randomUUID();
const organizationId = id() as OrganizationId;
const customerId = id() as CustomerId;
const quotationId = id() as QuoteId;
const now = new Date("2026-01-01T00:00:00.000Z");

const contract = Contract.create({
  id: id(),
  organizationId,
  customerId,
  quotationId,
  contractNumber: "CT-2026-0001",
  effectiveDate: now,
  expiryDate: new Date("2027-01-01T00:00:00.000Z"),
  now,
});
const version = ContractVersion.create({
  id: id(),
  organizationId,
  contractId: contract.id,
  versionNumber: 1,
  now,
});
const term = ContractTerm.create({
  id: id(),
  organizationId,
  contractVersionId: version.id,
  title: "Payment Terms",
  description: "Payment is due within 30 days.",
  mandatory: true,
  order: 1,
  now,
});
version.setTermIds([term.id], now);
const amendment = ContractAmendment.create({
  id: id(),
  organizationId,
  contractId: contract.id,
  reason: "Scope clarification",
  effectiveDate: now,
  now,
});


describe("Contracts persistence mappers", () => {
  it("round-trips Contract", () => {
    const restored = ContractMapper.fromRow(ContractMapper.toRow(contract));
    expect(restored.toSnapshot()).toEqual(contract.toSnapshot());
  });

  it("round-trips ContractVersion and term ids", () => {
    const restored = ContractVersionMapper.fromRow(ContractVersionMapper.toRow(version));
    expect(restored.toSnapshot()).toEqual(version.toSnapshot());
    expect(restored.locked).toBe(false);
  });

  it("round-trips ContractTerm and preserves ordering/mandatory state", () => {
    const restored = ContractTermMapper.fromRow(ContractTermMapper.toRow(term));
    expect(restored.toSnapshot()).toEqual(term.toSnapshot());
    expect(restored.order).toBe(1);
    expect(restored.mandatory).toBe(true);
  });

  it("round-trips ContractAmendment", () => {
    const restored = ContractAmendmentMapper.fromRow(ContractAmendmentMapper.toRow(amendment));
    expect(restored.toSnapshot()).toEqual(amendment.toSnapshot());
  });
});
