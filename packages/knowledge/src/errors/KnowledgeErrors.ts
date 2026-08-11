import { DomainError } from "@creative-lab/core";

export class KnowledgeArticleNotFoundError extends DomainError {
  readonly code = "KNOWLEDGE_ARTICLE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Knowledge article not found: ${identifier}`);
  }
}

export class KnowledgeVersionNotFoundError extends DomainError {
  readonly code = "KNOWLEDGE_VERSION_NOT_FOUND";
  constructor(identifier: string) {
    super(`Knowledge version not found: ${identifier}`);
  }
}

export class KnowledgeCategoryNotFoundError extends DomainError {
  readonly code = "KNOWLEDGE_CATEGORY_NOT_FOUND";
  constructor(identifier: string) {
    super(`Knowledge category not found: ${identifier}`);
  }
}

export class KnowledgeReferenceNotFoundError extends DomainError {
  readonly code = "KNOWLEDGE_REFERENCE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Knowledge reference not found: ${identifier}`);
  }
}

export class DuplicateArticleNumberError extends DomainError {
  readonly code = "DUPLICATE_ARTICLE_NUMBER";
  constructor(articleNumber: string, organizationId: string) {
    super(
      `Article number "${articleNumber}" already exists in organization "${organizationId}".`,
    );
  }
}

export class DuplicateCategoryNameError extends DomainError {
  readonly code = "DUPLICATE_CATEGORY_NAME";
  constructor(name: string, organizationId: string) {
    super(
      `Category name "${name}" already exists in organization "${organizationId}".`,
    );
  }
}

export class DuplicateKnowledgeReferenceError extends DomainError {
  readonly code = "DUPLICATE_KNOWLEDGE_REFERENCE";
  constructor(sourceId: string, targetId: string, type: string) {
    super(
      `Reference ${type} from "${sourceId}" to "${targetId}" already exists.`,
    );
  }
}

export class KnowledgeAlreadyActiveError extends DomainError {
  readonly code = "KNOWLEDGE_ALREADY_ACTIVE";
  constructor(articleId: string) {
    super(`Knowledge article "${articleId}" is already active.`);
  }
}

export class InvalidKnowledgeStateError extends DomainError {
  readonly code = "INVALID_KNOWLEDGE_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class KnowledgeValidationError extends DomainError {
  readonly code = "KNOWLEDGE_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}

export class CategoryInUseError extends DomainError {
  readonly code = "CATEGORY_IN_USE";
  constructor(categoryId: string) {
    super(
      `Category "${categoryId}" cannot be archived while ACTIVE articles exist.`,
    );
  }
}
