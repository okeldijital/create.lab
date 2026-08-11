import { DomainError } from "@creative-lab/core";

export class ServiceNotFoundError extends DomainError {
  readonly code = "SERVICE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Service not found: ${identifier}`);
  }
}

export class DuplicateServiceCodeError extends DomainError {
  readonly code = "DUPLICATE_SERVICE_CODE";
  constructor(serviceCode: string, organizationId: string) {
    super(
      `Service code "${serviceCode}" already exists in organization "${organizationId}".`,
    );
  }
}

export class CategoryNotFoundError extends DomainError {
  readonly code = "CATEGORY_NOT_FOUND";
  constructor(identifier: string) {
    super(`Service category not found: ${identifier}`);
  }
}

export class CategoryInUseError extends DomainError {
  readonly code = "CATEGORY_IN_USE";
  constructor(categoryId: string) {
    super(
      `Category "${categoryId}" cannot be archived while active services reference it.`,
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

export class PriceBookNotFoundError extends DomainError {
  readonly code = "PRICE_BOOK_NOT_FOUND";
  constructor(identifier: string) {
    super(`Price book not found: ${identifier}`);
  }
}

export class PublishedPriceBookExistsError extends DomainError {
  readonly code = "PUBLISHED_PRICE_BOOK_EXISTS";
  constructor(currency: string, organizationId: string) {
    super(
      `A published price book already exists for currency "${currency}" in organization "${organizationId}".`,
    );
  }
}

export class PriceRuleNotFoundError extends DomainError {
  readonly code = "PRICE_RULE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Price rule not found: ${identifier}`);
  }
}

export class InvalidPriceRangeError extends DomainError {
  readonly code = "INVALID_PRICE_RANGE";
  constructor(message: string) {
    super(message);
  }
}

export class DuplicatePriceRuleError extends DomainError {
  readonly code = "DUPLICATE_PRICE_RULE";
  constructor(serviceId: string, priceBookId: string) {
    super(
      `An active price rule already exists for service "${serviceId}" in price book "${priceBookId}".`,
    );
  }
}

export class InvalidServiceStateError extends DomainError {
  readonly code = "INVALID_SERVICE_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class ServicesValidationError extends DomainError {
  readonly code = "SERVICES_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}
