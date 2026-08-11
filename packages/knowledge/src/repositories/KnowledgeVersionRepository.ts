import type { OrganizationId } from "@creative-lab/organization";
import type { KnowledgeVersion } from "../aggregates/KnowledgeVersion/KnowledgeVersion.js";
import type { VersionStatus } from "../enums/VersionStatus.js";
import type {
  KnowledgeArticleId,
  KnowledgeVersionId,
} from "../types/ids.js";

export interface KnowledgeVersionRepository {
  findById(id: KnowledgeVersionId): Promise<KnowledgeVersion | null>;
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<KnowledgeVersion[]>;
  findByArticle(articleId: KnowledgeArticleId): Promise<KnowledgeVersion[]>;
  findByStatus(status: VersionStatus): Promise<KnowledgeVersion[]>;
  findCurrentVersion(
    articleId: KnowledgeArticleId,
  ): Promise<KnowledgeVersion | null>;
  save(version: KnowledgeVersion): Promise<void>;
  update(version: KnowledgeVersion): Promise<void>;
  archive(id: KnowledgeVersionId): Promise<void>;
  exists(id: KnowledgeVersionId): Promise<boolean>;
}
