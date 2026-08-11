import type { KnowledgeArticle } from "../aggregates/KnowledgeArticle/KnowledgeArticle.js";
import type { KnowledgeCategory } from "../aggregates/KnowledgeCategory/KnowledgeCategory.js";
import { KnowledgeStatus } from "../enums/KnowledgeStatus.js";
import {
  CategoryInUseError,
  DuplicateCategoryNameError,
  InvalidKnowledgeStateError,
} from "../errors/KnowledgeErrors.js";

export class CategoryPolicy {
  static assertMutable(category: KnowledgeCategory): void {
    if (category.isArchived) {
      throw new InvalidKnowledgeStateError(
        "Archived categories are immutable.",
      );
    }
  }

  static assertUniqueName(
    name: string,
    organizationId: string,
    existing: KnowledgeCategory | null,
  ): void {
    if (existing) {
      throw new DuplicateCategoryNameError(name, organizationId);
    }
  }

  /**
   * Categories cannot be archived while ACTIVE articles still reference them.
   */
  static assertCanArchive(
    category: KnowledgeCategory,
    articlesInCategory: readonly KnowledgeArticle[],
  ): void {
    this.assertMutable(category);
    const active = articlesInCategory.filter(
      (a) =>
        a.categoryId === category.id &&
        a.status === KnowledgeStatus.ACTIVE,
    );
    if (active.length > 0) {
      throw new CategoryInUseError(category.id);
    }
  }
}
