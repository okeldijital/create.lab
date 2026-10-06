import {
  ContractService,
  type ContractServiceDeps,
  asContractId,
} from "@creative-lab/contracts";
import { asCustomerId, type CustomerRepository } from "@creative-lab/crm";
import { asQuoteId, type QuoteRepository } from "@creative-lab/quotation";
import type { CreateContractCommand } from "../../commands/contracts/CreateContractCommand.js";
import type { ContractDto } from "../../dto/common.js";
import { AuthorizationError } from "../../errors/ApplicationErrors.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { ContractMapper } from "../../mappers/ContractMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type CreateContractHandlerDeps = Omit<
  ContractServiceDeps,
  "eventPublisher"
> & {
  eventPublisher: CollectingEventPublisher;
  customerRepository: CustomerRepository;
  quoteRepository: QuoteRepository;
};

export class CreateContractHandler
  implements CommandHandler<CreateContractCommand, ContractDto>
{
  readonly commandType = "CreateContract" as const;
  private readonly service: ContractService;
  private readonly customerRepository: CustomerRepository;
  private readonly quoteRepository: QuoteRepository;

  constructor(deps: CreateContractHandlerDeps) {
    const { customerRepository, quoteRepository, ...serviceDeps } = deps;
    this.service = new ContractService(serviceDeps);
    this.customerRepository = customerRepository;
    this.quoteRepository = quoteRepository;
  }

  async handle(
    command: CreateContractCommand,
    context: ApplicationContext,
  ): Promise<ContractDto> {
    validateRequired(command, [
      "customerId",
      "quotationId",
      "effectiveDate",
    ]);

    const customer = await this.customerRepository.findById(
      asCustomerId(command.customerId),
    );
    const quote = await this.quoteRepository.findById(
      asQuoteId(command.quotationId),
    );

    if (
      !customer ||
      !quote ||
      String(customer.organizationId) !== String(context.organizationId) ||
      String(quote.organizationId) !== String(context.organizationId) ||
      String(quote.customerId) !== String(customer.id)
    ) {
      throw new AuthorizationError();
    }

    const contract = await this.service.create({
      organizationId: context.organizationId,
      customerId: asCustomerId(command.customerId),
      quotationId: asQuoteId(command.quotationId),
      contractNumber: command.contractNumber,
      effectiveDate: command.effectiveDate,
      expiryDate: command.expiryDate,
    });

    return ContractMapper.toDto(contract);
  }
}
