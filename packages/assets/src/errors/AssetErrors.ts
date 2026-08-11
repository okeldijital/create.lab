import { DomainError } from "@creative-lab/core";

export class AssetNotFoundError extends DomainError {
  readonly code = "ASSET_NOT_FOUND";
  constructor(identifier: string) {
    super(`Asset not found: ${identifier}`);
  }
}

export class DuplicateAssetError extends DomainError {
  readonly code = "DUPLICATE_ASSET";
  constructor(message: string) {
    super(message);
  }
}

export class DuplicateVersionError extends DomainError {
  readonly code = "DUPLICATE_VERSION";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidVersionError extends DomainError {
  readonly code = "INVALID_VERSION";
  constructor(message: string) {
    super(message);
  }
}

export class CurrentVersionError extends DomainError {
  readonly code = "CURRENT_VERSION_ERROR";
  constructor(message: string) {
    super(message);
  }
}

export class CollectionNotFoundError extends DomainError {
  readonly code = "COLLECTION_NOT_FOUND";
  constructor(identifier: string) {
    super(`Asset collection not found: ${identifier}`);
  }
}

export class DuplicateCollectionError extends DomainError {
  readonly code = "DUPLICATE_COLLECTION";
  constructor(name: string, organizationId: string) {
    super(
      `Asset collection "${name}" already exists in organization "${organizationId}".`,
    );
  }
}

export class RelationshipError extends DomainError {
  readonly code = "RELATIONSHIP_ERROR";
  constructor(message: string) {
    super(message);
  }
}

export class DuplicateRelationshipError extends DomainError {
  readonly code = "DUPLICATE_RELATIONSHIP";
  constructor(message: string) {
    super(message);
  }
}

export class CircularRelationshipError extends DomainError {
  readonly code = "CIRCULAR_RELATIONSHIP";
  constructor(message: string) {
    super(message);
  }
}

export class AssetVersionNotFoundError extends DomainError {
  readonly code = "ASSET_VERSION_NOT_FOUND";
  constructor(identifier: string) {
    super(`Asset version not found: ${identifier}`);
  }
}

export class InvalidAssetStateError extends DomainError {
  readonly code = "INVALID_ASSET_STATE";
  constructor(message: string) {
    super(message);
  }
}

export class AssetValidationError extends DomainError {
  readonly code = "ASSET_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}
