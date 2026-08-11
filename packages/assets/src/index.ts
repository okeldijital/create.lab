/**
 * @creative-lab/assets
 *
 * Asset Management bounded context — EPIC-210.
 * Owns identity, classification, versioning, collections, and relationships
 * of creative assets. Never stores binary data or file paths.
 */

export {
  Asset,
  AssetVersion,
  AssetCollection,
  AssetRelationship,
} from "./aggregates/index.js";
export type {
  CreateAssetProps,
  AssetSnapshot,
  CreateAssetVersionProps,
  AssetVersionSnapshot,
  CreateAssetCollectionProps,
  AssetCollectionSnapshot,
  CreateAssetRelationshipProps,
  AssetRelationshipSnapshot,
} from "./aggregates/index.js";

export {
  AssetName,
  AssetDescription,
  VersionNumber,
  Checksum,
  CollectionName,
  Metadata,
  RelationshipLabel,
} from "./value-objects/index.js";

export {
  AssetStatus,
  AssetVersionStatus,
  AssetType,
  RelationshipType,
} from "./enums/index.js";

export {
  AssetCreated,
  AssetUpdated,
  AssetArchived,
  AssetRestored,
  AssetVersionCreated,
  AssetVersionPromoted,
  CollectionCreated,
  CollectionArchived,
  AssetAddedToCollection,
  AssetRemovedFromCollection,
  RelationshipCreated,
  RelationshipRemoved,
} from "./events/index.js";

export type {
  AssetRepository,
  AssetVersionRepository,
  AssetCollectionRepository,
  AssetRelationshipRepository,
} from "./repositories/index.js";

export {
  AssetService,
  VersionService,
  CollectionService,
  RelationshipService,
} from "./services/index.js";
export type {
  AssetServiceDeps,
  CreateAssetWithVersionProps,
  CreateVersionProps,
  VersionServiceDeps,
  CollectionServiceDeps,
  RelationshipServiceDeps,
} from "./services/index.js";

export {
  AssetLifecyclePolicy,
  VersionPolicy,
  CollectionPolicy,
  RelationshipPolicy,
} from "./policies/index.js";

export {
  AssetFactory,
  AssetVersionFactory,
  AssetCollectionFactory,
  AssetRelationshipFactory,
} from "./factories/index.js";

export {
  AssetNotFoundError,
  DuplicateAssetError,
  DuplicateVersionError,
  InvalidVersionError,
  CurrentVersionError,
  CollectionNotFoundError,
  DuplicateCollectionError,
  RelationshipError,
  DuplicateRelationshipError,
  CircularRelationshipError,
  AssetVersionNotFoundError,
  InvalidAssetStateError,
  AssetValidationError,
} from "./errors/index.js";

export type {
  AssetId,
  AssetVersionId,
  AssetCollectionId,
  AssetRelationshipId,
  OrganizationId,
  ProjectId,
  ProductionId,
} from "./types/index.js";
export {
  asAssetId,
  asAssetVersionId,
  asAssetCollectionId,
  asAssetRelationshipId,
  asOrganizationId,
} from "./types/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export { uniqueIds } from "./utils/index.js";
