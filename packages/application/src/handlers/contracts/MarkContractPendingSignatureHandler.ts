import {
  ContractService,
  type ContractServiceDeps,
  asContractId,
} from "@creative-lab/contracts";
import type { MarkContractPendingSignatureCommand } from "../../commands/contracts/MarkContractPendingSignatureCommand.js";
import type { ContractDto } from "../../dto/common.js";
import { AuthorizationError } from "../../errors/ApplicationErrors.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { ContractMapper } from "../../mappers/ContractMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type MarkContractPendingSignatureHandlerDeps = Omit<
  ContractServiceDeps,
  "eventPublisher"
> & {
  eventPublisher: CollectingEventPublisher;
};

export class MarkContractPendingSignatureHandler
  implements CommandHandler<
    MarkContractPendingSignatureCommand,
    ContractDto
  >
{
  readonly commandType = "MarkContractPendingSignature" as const;
  private readonly service: ContractService;

  constructor(deps: MarkContractPendingSignatureHandlerDeps) {
    this.service = new ContractService(deps);
  }

  async handle(
    command: MarkContractPendingSignatureCommand,
    context: ApplicationContext,
  ): Promise<ContractDto> {
    validateRequired(command, ["contractId"]);
    const contract = await this.service.getById(
      asContractId(command.contractId),
    );
    if (String(contract.organizationId) !== String(context.organizationId)) {
      throw new AuthorizationError();
    }
    return ContractMapper.toDto(
      await this.service.markPendingSignature(asContractId(command.contractId)),
    );
  }
}
