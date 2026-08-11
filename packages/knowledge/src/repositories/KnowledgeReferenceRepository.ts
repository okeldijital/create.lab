import type { OrganizationId } from "@creative-lab/organization";
import type { KnowledgeReference } from "../aggregates/KnowledgeReference/KnowledgeReference.js";
import type { RelationshipType } from "../enums/RelationshipType.js";
import type {
  KnowledgeArticleId,
  KnowledgeReferenceId,
} from "../types/ids.js";

export interface KnowledgeReferenceRepository {
  findById(id: KnowledgeReferenceId): Promise<KnowledgeReference | null>;
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<KnowledgeReference[]>;
  findBySource(
    sourceArticleId: KnowledgeArticleId,
  ): Promise<KnowledgeReference[]>;
  findByTarget(
    targetArticleId: KnowledgeArticleId,
  ): Promise<KnowledgeReference[]>;
  findByRelationship(
    sourceArticleId: KnowledgeArticleId,
    targetArticleId: KnowledgeArticleId,
    relationshipType: RelationshipType,
  ): Promise<KnowledgeReference | null>;
  save(reference: KnowledgeReference): Promise<void>;
  update(reference: KnowledgeReference): Promise<void>;
  archive(id: KnowledgeReferenceId): Promise<void>;
  exists(id: KnowledgeReferenceId): Promise<boolean>;
}
