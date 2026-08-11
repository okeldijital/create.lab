import type { KnowledgeArticle } from "../aggregates/KnowledgeArticle/KnowledgeArticle.js";
import {
  KnowledgeStatus,
  canTransitionKnowledge,
} from "../enums/KnowledgeStatus.js";
import { InvalidKnowledgeStateError } from "../errors/KnowledgeErrors.js";

export class KnowledgeLifecyclePolicy {
  static assertCanTransition(
    article: KnowledgeArticle,
    to: KnowledgeStatus,
  ): void {
    if (article.isArchived) {
      throw new InvalidKnowledgeStateError(
        "Archived knowledge articles are immutable.",
      );
    }
    if (!canTransitionKnowledge(article.status, to)) {
      throw new InvalidKnowledgeStateError(
        `Illegal knowledge transition: ${article.status} → ${to}.`,
      );
    }
  }

  static assertMutable(article: KnowledgeArticle): void {
    if (article.isArchived) {
      throw new InvalidKnowledgeStateError(
        "Archived knowledge articles are immutable.",
      );
    }
  }

  static assertStructurallyEditable(article: KnowledgeArticle): void {
    if (article.isArchived) {
      throw new InvalidKnowledgeStateError(
        "Archived knowledge articles are immutable.",
      );
    }
    if (article.isRetired) {
      throw new InvalidKnowledgeStateError(
        "Retired knowledge articles only allow archive.",
      );
    }
  }

  static assertCanArchive(article: KnowledgeArticle): void {
    this.assertCanTransition(article, KnowledgeStatus.ARCHIVED);
  }

  static assertCategoryMutable(article: KnowledgeArticle): void {
    this.assertStructurallyEditable(article);
    if (
      article.status === KnowledgeStatus.ACTIVE ||
      article.status === KnowledgeStatus.RETIRED
    ) {
      throw new InvalidKnowledgeStateError(
        "Category is immutable once the article is ACTIVE.",
      );
    }
  }

  static assertCanActivate(article: KnowledgeArticle): void {
    this.assertCanTransition(article, KnowledgeStatus.ACTIVE);
    if (!article.currentVersionId) {
      throw new InvalidKnowledgeStateError(
        "Cannot activate article without a current version.",
      );
    }
  }
}
