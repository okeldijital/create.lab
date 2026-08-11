import type { KnowledgeArticle } from "@creative-lab/knowledge";
import type { KnowledgeArticleDto } from "../dto/common.js";

export class KnowledgeMapper {
  static toDto(article: KnowledgeArticle): KnowledgeArticleDto {
    return {
      id: article.id,
      organizationId: article.organizationId,
      articleNumber: article.articleNumber.value,
      title: article.title.value,
      status: article.status,
      categoryId: article.categoryId,
    };
  }
}
