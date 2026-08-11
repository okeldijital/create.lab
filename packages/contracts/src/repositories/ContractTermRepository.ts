import type { ContractTerm } from "../aggregates/ContractTerm/ContractTerm.js";
import type { ContractTermId, ContractVersionId } from "../types/ids.js";

export interface ContractTermRepository {
  findById(id: ContractTermId): Promise<ContractTerm | null>;
  findByVersion(versionId: ContractVersionId): Promise<ContractTerm[]>;
  save(term: ContractTerm): Promise<void>;
  update(term: ContractTerm): Promise<void>;
  delete(id: ContractTermId): Promise<void>;
  exists(id: ContractTermId): Promise<boolean>;
}
