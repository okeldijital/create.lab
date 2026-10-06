import { asContractId, type ContractRepository } from "@creative-lab/contracts";
import type { ContractDto } from "../../dto/common.js";
import { AuthorizationError, NotFoundError } from "../../errors/ApplicationErrors.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import { ContractMapper } from "../../mappers/ContractMapper.js";
import type { GetContractQuery } from "../../queries/GetContractQuery.js";
import type { ApplicationContext } from "../../types/context.js";

export type GetContractHandlerDeps = {
  contractRepository: ContractRepository;
};

export class GetContractHandler
  implements QueryHandler<GetContractQuery, ContractDto>
{
  readonly queryType = "GetContract" as const;

  constructor(private readonly deps: GetContractHandlerDeps) {}

  async handle(
    query: GetContractQuery,
    context: ApplicationContext,
  ): Promise<ContractDto> {
    const contract = await this.deps.contractRepository.findById(
      asContractId(query.contractId),
    );
    if (!contract) {
      throw new NotFoundError("Contract", query.contractId);
    }
    if (String(contract.organizationId) !== String(context.organizationId)) {
      throw new AuthorizationError();
    }
    return ContractMapper.toDto(contract);
  }
}
