import {
  Contract,
  ContractAmendment,
  ContractTerm,
  ContractVersion,
  asContractAmendmentId,
  asContractId,
  asContractTermId,
  asContractVersionId,
  type ContractAmendmentSnapshot,
  type ContractSnapshot,
  type ContractTermSnapshot,
  type ContractVersionSnapshot,
} from "@creative-lab/contracts";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { contractAmendments, contractTerms, contractVersions, contracts } from "./schema.js";

type ContractRow = InferSelectModel<typeof contracts>;
type ContractVersionRow = InferSelectModel<typeof contractVersions>;
type ContractTermRow = InferSelectModel<typeof contractTerms>;
type ContractAmendmentRow = InferSelectModel<typeof contractAmendments>;

export const ContractMapper = {
  toRow(contract: Contract): InferInsertModel<typeof contracts> {
    const snapshot = contract.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      contractNumber: snapshot.contractNumber,
      customerId: snapshot.customerId,
      quotationId: snapshot.quotationId,
      status: snapshot.status,
      effectiveDate: snapshot.effectiveDate,
      expiryDate: snapshot.expiryDate,
      currentVersionId: snapshot.currentVersionId,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      archivedAt: snapshot.archivedAt,
    };
  },
  fromRow(row: ContractRow): Contract {
    const snapshot: ContractSnapshot = {
      id: asContractId(row.id),
      organizationId: row.organizationId as ContractSnapshot["organizationId"],
      contractNumber: row.contractNumber,
      customerId: row.customerId as ContractSnapshot["customerId"],
      quotationId: row.quotationId as ContractSnapshot["quotationId"],
      status: row.status as ContractSnapshot["status"],
      effectiveDate: row.effectiveDate,
      expiryDate: row.expiryDate,
      currentVersionId: row.currentVersionId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      archivedAt: row.archivedAt,
    };
    return Contract.reconstitute(snapshot);
  },
};

export const ContractVersionMapper = {
  toRow(version: ContractVersion): InferInsertModel<typeof contractVersions> {
    const snapshot = version.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      contractId: snapshot.contractId,
      versionNumber: snapshot.versionNumber,
      termIds: snapshot.termIds as string[],
      status: snapshot.status,
      locked: snapshot.locked,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  },
  fromRow(row: ContractVersionRow): ContractVersion {
    const snapshot: ContractVersionSnapshot = {
      id: asContractVersionId(row.id),
      organizationId: row.organizationId as ContractVersionSnapshot["organizationId"],
      contractId: asContractId(row.contractId),
      versionNumber: row.versionNumber,
      termIds: (row.termIds ?? []).map(asContractTermId),
      status: row.status as ContractVersionSnapshot["status"],
      locked: row.locked,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return ContractVersion.reconstitute(snapshot);
  },
};

export const ContractTermMapper = {
  toRow(term: ContractTerm): InferInsertModel<typeof contractTerms> {
    const snapshot = term.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      contractVersionId: snapshot.contractVersionId,
      title: snapshot.title,
      description: snapshot.description,
      mandatory: snapshot.mandatory,
      termOrder: snapshot.order,
      createdAt: snapshot.createdAt,
    };
  },
  fromRow(row: ContractTermRow): ContractTerm {
    const snapshot: ContractTermSnapshot = {
      id: asContractTermId(row.id),
      organizationId: row.organizationId as ContractTermSnapshot["organizationId"],
      contractVersionId: asContractVersionId(row.contractVersionId),
      title: row.title,
      description: row.description,
      mandatory: row.mandatory,
      order: row.termOrder,
      createdAt: row.createdAt,
    };
    return ContractTerm.reconstitute(snapshot);
  },
};

export const ContractAmendmentMapper = {
  toRow(amendment: ContractAmendment): InferInsertModel<typeof contractAmendments> {
    const snapshot = amendment.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      contractId: snapshot.contractId,
      reason: snapshot.reason,
      effectiveDate: snapshot.effectiveDate,
      status: snapshot.status,
      resultingVersionId: snapshot.resultingVersionId,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  },
  fromRow(row: ContractAmendmentRow): ContractAmendment {
    const snapshot: ContractAmendmentSnapshot = {
      id: asContractAmendmentId(row.id),
      organizationId: row.organizationId as ContractAmendmentSnapshot["organizationId"],
      contractId: asContractId(row.contractId),
      reason: row.reason,
      effectiveDate: row.effectiveDate,
      status: row.status as ContractAmendmentSnapshot["status"],
      resultingVersionId: row.resultingVersionId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return ContractAmendment.reconstitute(snapshot);
  },
};
