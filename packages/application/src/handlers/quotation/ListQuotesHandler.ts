import type { QuoteRepository } from "@creative-lab/quotation";
import type { QuoteDto } from "../../dto/common.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import { QuoteMapper } from "../../mappers/QuoteMapper.js";
import type { ListQuotesQuery } from "../../queries/ListQuotesQuery.js";
import type { ApplicationContext } from "../../types/context.js";

export type ListQuotesHandlerDeps = {
  quoteRepository: QuoteRepository;
};

export class ListQuotesHandler
  implements QueryHandler<ListQuotesQuery, QuoteDto[]>
{
  readonly queryType = "ListQuotes" as const;

  constructor(private readonly deps: ListQuotesHandlerDeps) {}

  async handle(
    query: ListQuotesQuery,
    context: ApplicationContext,
  ): Promise<QuoteDto[]> {
    let quotes = await this.deps.quoteRepository.findByOrganization(
      context.organizationId,
    );

    if (query.customerId) {
      quotes = quotes.filter(
        (quote) => String(quote.customerId) === String(query.customerId),
      );
    }
    if (query.status) {
      quotes = quotes.filter((quote) => quote.status === query.status);
    }

    return quotes.map(QuoteMapper.toDto);
  }
}
