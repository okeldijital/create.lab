import {
  QuoteService,
  type QuoteServiceDeps,
} from "@creative-lab/quotation";
import {
  asCustomerId,
  type CustomerRepository,
  type OpportunityId,
} from "@creative-lab/crm";
import type { CreateQuoteCommand } from "../../commands/quotation/CreateQuoteCommand.js";
import type { QuoteDto } from "../../dto/common.js";
import { AuthorizationError } from "../../errors/ApplicationErrors.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { QuoteMapper } from "../../mappers/QuoteMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type CreateQuoteHandlerDeps = Omit<QuoteServiceDeps, "eventPublisher"> & {
  eventPublisher: CollectingEventPublisher;
  customerRepository: CustomerRepository;
};

export class CreateQuoteHandler
  implements CommandHandler<CreateQuoteCommand, QuoteDto>
{
  readonly commandType = "CreateQuote" as const;
  private readonly service: QuoteService;
  private readonly customerRepository: CustomerRepository;

  constructor(deps: CreateQuoteHandlerDeps) {
    const { customerRepository, ...serviceDeps } = deps;
    this.service = new QuoteService(serviceDeps);
    this.customerRepository = customerRepository;
  }

  async handle(
    command: CreateQuoteCommand,
    context: ApplicationContext,
  ): Promise<QuoteDto> {
    validateRequired(command, ["customerId"]);

    const customer = await this.customerRepository.findById(
      asCustomerId(command.customerId),
    );
    if (
      !customer ||
      String(customer.organizationId) !== String(context.organizationId)
    ) {
      throw new AuthorizationError();
    }

    const quote = await this.service.create({
      organizationId: context.organizationId,
      customerId: asCustomerId(command.customerId),
      opportunityId: command.opportunityId as OpportunityId | null | undefined,
      currency: command.currency,
      quoteNumber: command.quoteNumber,
      validUntil: command.validUntil,
    });

    return QuoteMapper.toDto(quote);
  }
}
