import type { KnowledgeReference } from "../aggregates/KnowledgeReference/KnowledgeReference.js";
import type { RelationshipType } from "../enums/RelationshipType.js";
import {
  DuplicateKnowledgeReferenceError,
  InvalidKnowledgeStateError,
  KnowledgeValidationError,
} from "../errors/KnowledgeErrors.js";
import type { KnowledgeArticleId } from "../types/ids.js";

export class ReferencePolicy {
  static assertNoSelfReference(
    sourceArticleId: KnowledgeArticleId,
    targetArticleId: KnowledgeArticleId,
  ): void {
    if (sourceArticleId === targetArticleId) {
      throw new KnowledgeValidationError(
        "Knowledge reference cannot be self-referential.",
      );
    }
  }

  static assertUniqueRelationship(
    sourceArticleId: KnowledgeArticleId,
    targetArticleId: KnowledgeArticleId,
    relationshipType: RelationshipType,
    existing: KnowledgeReference | null,
  ): void {
    if (existing && existing.isActive) {
      throw new DuplicateKnowledgeReferenceError(
        sourceArticleId,
        targetArticleId,
        relationshipType,
      );
    }
  }

  static assertActive(reference: KnowledgeReference): void {
    if (!reference.isActive) {
      throw new InvalidKnowledgeStateError(
        "Reference is not active and cannot be modified.",
      );
    }
  }

  static assertCanCreate(
    sourceArticleId: KnowledgeArticleId,
    targetArticleId: KnowledgeArticleId,
    relationshipType: RelationshipType,
    existing: KnowledgeReference | null,
  ): void {
    this.assertNoSelfReference(sourceArticleId, targetArticleId);
    this.assertUniqueRelationship(
      sourceArticleId,
      targetArticleId,
      relationshipType,
      existing,
    );
  }
}
