import type {
  KnowledgeArticleRepository,
  KnowledgeStatus,
} from "@creative-lab/knowledge";
import type { KnowledgeArticleDto } from "../../dto/common.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import { KnowledgeMapper } from "../../mappers/KnowledgeMapper.js";
import type { SearchKnowledgeQuery } from "../../queries/SearchKnowledgeQuery.js";
import type { ApplicationContext } from "../../types/context.js";

export type SearchKnowledgeHandlerDeps = {
  articleRepository: KnowledgeArticleRepository;
};

/**
 * Read-only knowledge listing/filter.
 * Does not implement search engines — filters domain repository results only.
 */
export class SearchKnowledgeHandler
  implements QueryHandler<SearchKnowledgeQuery, KnowledgeArticleDto[]>
{
  readonly queryType = "SearchKnowledge" as const;

  constructor(private readonly deps: SearchKnowledgeHandlerDeps) {}

  async handle(
    query: SearchKnowledgeQuery,
    context: ApplicationContext,
  ): Promise<KnowledgeArticleDto[]> {
    let articles = await this.deps.articleRepository.findByOrganization(
      context.organizationId,
    );
    if (query.categoryId) {
      articles = articles.filter((a) => a.categoryId === query.categoryId);
    }
    if (query.status) {
      articles = articles.filter(
        (a) => a.status === (query.status as KnowledgeStatus),
      );
    }
    if (query.titleContains) {
      const needle = query.titleContains.toLowerCase();
      articles = articles.filter((a) =>
        a.title.value.toLowerCase().includes(needle),
      );
    }
    return articles.map((a) => KnowledgeMapper.toDto(a));
  }
}
