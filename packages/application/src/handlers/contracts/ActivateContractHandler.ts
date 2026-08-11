import {
  ContractService,
  type ContractServiceDeps,
  asContractId,
} from "@creative-lab/contracts";
import type { ActivateContractCommand } from "../../commands/contracts/ActivateContractCommand.js";
import type { ContractDto } from "../../dto/common.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { ContractMapper } from "../../mappers/ContractMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type ActivateContractHandlerDeps = Omit<
  ContractServiceDeps,
  "eventPublisher"
> & {
  eventPublisher: CollectingEventPublisher;
};

export class ActivateContractHandler
  implements CommandHandler<ActivateContractCommand, ContractDto>
{
  readonly commandType = "ActivateContract" as const;
  private readonly service: ContractService;

  constructor(deps: ActivateContractHandlerDeps) {
    this.service = new ContractService(deps);
  }

  async handle(
    command: ActivateContractCommand,
    _context: ApplicationContext,
  ): Promise<ContractDto> {
    validateRequired(command, ["contractId"]);
    const contract = await this.service.activate(
      asContractId(command.contractId),
    );
    return ContractMapper.toDto(contract);
  }
}
