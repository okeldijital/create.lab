import {
  QuoteService,
  type QuoteServiceDeps,
  asQuoteId,
} from "@creative-lab/quotation";
import type { IssueQuoteCommand } from "../../commands/quotation/IssueQuoteCommand.js";
import type { QuoteDto } from "../../dto/common.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { QuoteMapper } from "../../mappers/QuoteMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type IssueQuoteHandlerDeps = Omit<QuoteServiceDeps, "eventPublisher"> & {
  eventPublisher: CollectingEventPublisher;
};

export class IssueQuoteHandler
  implements CommandHandler<IssueQuoteCommand, QuoteDto>
{
  readonly commandType = "IssueQuote" as const;
  private readonly service: QuoteService;

  constructor(deps: IssueQuoteHandlerDeps) {
    this.service = new QuoteService(deps);
  }

  async handle(
    command: IssueQuoteCommand,
    _context: ApplicationContext,
  ): Promise<QuoteDto> {
    validateRequired(command, ["quoteId"]);
    const quote = await this.service.issue(asQuoteId(command.quoteId));
    return QuoteMapper.toDto(quote);
  }
}
