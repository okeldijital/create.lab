import type { OrganizationId } from "@creative-lab/organization";
import type { KnowledgeArticle } from "../aggregates/KnowledgeArticle/KnowledgeArticle.js";
import type { KnowledgeStatus } from "../enums/KnowledgeStatus.js";
import type {
  KnowledgeArticleId,
  KnowledgeCategoryId,
} from "../types/ids.js";

export interface KnowledgeArticleRepository {
  findById(id: KnowledgeArticleId): Promise<KnowledgeArticle | null>;
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<KnowledgeArticle[]>;
  findByCategory(categoryId: KnowledgeCategoryId): Promise<KnowledgeArticle[]>;
  findByStatus(status: KnowledgeStatus): Promise<KnowledgeArticle[]>;
  findByArticleNumber(
    organizationId: OrganizationId,
    articleNumber: string,
  ): Promise<KnowledgeArticle | null>;
  save(article: KnowledgeArticle): Promise<void>;
  update(article: KnowledgeArticle): Promise<void>;
  archive(id: KnowledgeArticleId): Promise<void>;
  exists(id: KnowledgeArticleId): Promise<boolean>;
}
