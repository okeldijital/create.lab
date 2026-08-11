import type { Contract } from "@creative-lab/contracts";
import type { ContractDto } from "../dto/common.js";

export class ContractMapper {
  static toDto(contract: Contract): ContractDto {
    return {
      id: contract.id,
      organizationId: contract.organizationId,
      contractNumber: contract.contractNumber.value,
      customerId: contract.customerId,
      status: contract.status,
      quotationId: contract.quotationId,
    };
  }
}
