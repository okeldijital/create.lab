import type { CustomerId } from "@creative-lab/crm";
import type { OrganizationId } from "@creative-lab/organization";
import type { QuoteId } from "@creative-lab/quotation";
import type { Contract } from "../aggregates/Contract/Contract.js";
import type { ContractStatus } from "../enums/ContractStatus.js";
import type { ContractId } from "../types/ids.js";

export interface ContractRepository {
  findById(id: ContractId): Promise<Contract | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Contract[]>;
  findByCustomer(customerId: CustomerId): Promise<Contract[]>;
  findByQuotation(quotationId: QuoteId): Promise<Contract[]>;
  findByStatus(status: ContractStatus): Promise<Contract[]>;
  findByContractNumber(
    organizationId: OrganizationId,
    contractNumber: string,
  ): Promise<Contract | null>;
  save(contract: Contract): Promise<void>;
  update(contract: Contract): Promise<void>;
  archive(id: ContractId): Promise<void>;
  exists(id: ContractId): Promise<boolean>;
}
