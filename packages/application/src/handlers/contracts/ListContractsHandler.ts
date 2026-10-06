import type { ContractRepository } from "@creative-lab/contracts";
import type { ContractDto } from "../../dto/common.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import { ContractMapper } from "../../mappers/ContractMapper.js";
import type { ListContractsQuery } from "../../queries/ListContractsQuery.js";
import type { ApplicationContext } from "../../types/context.js";

export type ListContractsHandlerDeps = {
  contractRepository: ContractRepository;
};

export class ListContractsHandler
  implements QueryHandler<ListContractsQuery, ContractDto[]>
{
  readonly queryType = "ListContracts" as const;

  constructor(private readonly deps: ListContractsHandlerDeps) {}

  async handle(
    query: ListContractsQuery,
    context: ApplicationContext,
  ): Promise<ContractDto[]> {
    let contracts = await this.deps.contractRepository.findByOrganization(
      context.organizationId,
    );

    if (query.customerId) {
      contracts = contracts.filter(
        (contract) =>
          String(contract.customerId) === String(query.customerId),
      );
    }
    if (query.status) {
      contracts = contracts.filter((contract) => contract.status === query.status);
    }

    return contracts.map(ContractMapper.toDto);
  }
}
