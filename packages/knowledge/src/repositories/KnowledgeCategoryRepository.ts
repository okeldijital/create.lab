import type { OrganizationId } from "@creative-lab/organization";
import type { KnowledgeCategory } from "../aggregates/KnowledgeCategory/KnowledgeCategory.js";
import type { CategoryStatus } from "../enums/CategoryStatus.js";
import type { KnowledgeCategoryId } from "../types/ids.js";

export interface KnowledgeCategoryRepository {
  findById(id: KnowledgeCategoryId): Promise<KnowledgeCategory | null>;
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<KnowledgeCategory[]>;
  findByStatus(status: CategoryStatus): Promise<KnowledgeCategory[]>;
  findByName(
    organizationId: OrganizationId,
    name: string,
  ): Promise<KnowledgeCategory | null>;
  save(category: KnowledgeCategory): Promise<void>;
  update(category: KnowledgeCategory): Promise<void>;
  archive(id: KnowledgeCategoryId): Promise<void>;
  exists(id: KnowledgeCategoryId): Promise<boolean>;
}
