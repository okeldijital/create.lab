import type { ContractAmendment } from "../aggregates/ContractAmendment/ContractAmendment.js";
import type { ContractAmendmentId, ContractId } from "../types/ids.js";

export interface ContractAmendmentRepository {
  findById(id: ContractAmendmentId): Promise<ContractAmendment | null>;
  findByContract(contractId: ContractId): Promise<ContractAmendment[]>;
  save(amendment: ContractAmendment): Promise<void>;
  update(amendment: ContractAmendment): Promise<void>;
  exists(id: ContractAmendmentId): Promise<boolean>;
}
