import { asQuoteId, type QuoteRepository } from "@creative-lab/quotation";
import type { QuoteDto } from "../../dto/common.js";
import { AuthorizationError, NotFoundError } from "../../errors/ApplicationErrors.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import { QuoteMapper } from "../../mappers/QuoteMapper.js";
import type { GetQuoteQuery } from "../../queries/GetQuoteQuery.js";
import type { ApplicationContext } from "../../types/context.js";

export type GetQuoteHandlerDeps = {
  quoteRepository: QuoteRepository;
};

export class GetQuoteHandler
  implements QueryHandler<GetQuoteQuery, QuoteDto>
{
  readonly queryType = "GetQuote" as const;

  constructor(private readonly deps: GetQuoteHandlerDeps) {}

  async handle(
    query: GetQuoteQuery,
    context: ApplicationContext,
  ): Promise<QuoteDto> {
    const quote = await this.deps.quoteRepository.findById(
      asQuoteId(query.quoteId),
    );

    if (!quote) {
      throw new NotFoundError("Quote", query.quoteId);
    }
    if (String(quote.organizationId) !== String(context.organizationId)) {
      throw new AuthorizationError();
    }

    return QuoteMapper.toDto(quote);
  }
}
