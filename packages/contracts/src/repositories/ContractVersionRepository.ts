import type { ContractVersion } from "../aggregates/ContractVersion/ContractVersion.js";
import type { ContractId, ContractVersionId } from "../types/ids.js";

export interface ContractVersionRepository {
  findById(id: ContractVersionId): Promise<ContractVersion | null>;
  findByContract(contractId: ContractId): Promise<ContractVersion[]>;
  findCurrentVersion(contractId: ContractId): Promise<ContractVersion | null>;
  save(version: ContractVersion): Promise<void>;
  update(version: ContractVersion): Promise<void>;
  exists(id: ContractVersionId): Promise<boolean>;
}
