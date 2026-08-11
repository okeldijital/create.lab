import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { AssetStatus } from "../enums/AssetStatus.js";
import type { AssetType } from "../enums/AssetType.js";
import type { AssetVersionStatus } from "../enums/AssetVersionStatus.js";
import type { RelationshipType } from "../enums/RelationshipType.js";
import type {
  AssetCollectionId,
  AssetId,
  AssetRelationshipId,
  AssetVersionId,
} from "../types/ids.js";

export class AssetCreated extends DomainEvent<
  "AssetCreated",
  Readonly<{
    assetId: string;
    name: string;
    assetType: AssetType;
    currentVersionId: string;
    status: AssetStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    assetId: AssetId;
    name: string;
    assetType: AssetType;
    currentVersionId: AssetVersionId;
    status: AssetStatus;
    occurredAt?: Date;
  }): AssetCreated {
    return new AssetCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "AssetCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.assetId,
      organizationId: input.organizationId,
      payload: {
        assetId: input.assetId,
        name: input.name,
        assetType: input.assetType,
        currentVersionId: input.currentVersionId,
        status: input.status,
      },
    });
  }
}

export class AssetUpdated extends DomainEvent<
  "AssetUpdated",
  Readonly<{ assetId: string }>
> {
  static create(input: {
    organizationId: string;
    assetId: AssetId;
    occurredAt?: Date;
  }): AssetUpdated {
    return new AssetUpdated({
      eventId: DomainEvent.nextEventId(),
      eventType: "AssetUpdated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.assetId,
      organizationId: input.organizationId,
      payload: { assetId: input.assetId },
    });
  }
}

export class AssetArchived extends DomainEvent<
  "AssetArchived",
  Readonly<{ assetId: string }>
> {
  static create(input: {
    organizationId: string;
    assetId: AssetId;
    occurredAt?: Date;
  }): AssetArchived {
    return new AssetArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "AssetArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.assetId,
      organizationId: input.organizationId,
      payload: { assetId: input.assetId },
    });
  }
}

export class AssetRestored extends DomainEvent<
  "AssetRestored",
  Readonly<{ assetId: string }>
> {
  static create(input: {
    organizationId: string;
    assetId: AssetId;
    occurredAt?: Date;
  }): AssetRestored {
    return new AssetRestored({
      eventId: DomainEvent.nextEventId(),
      eventType: "AssetRestored",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.assetId,
      organizationId: input.organizationId,
      payload: { assetId: input.assetId },
    });
  }
}

export class AssetVersionCreated extends DomainEvent<
  "AssetVersionCreated",
  Readonly<{
    versionId: string;
    assetId: string;
    versionNumber: number;
    status: AssetVersionStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    versionId: AssetVersionId;
    assetId: AssetId;
    versionNumber: number;
    status: AssetVersionStatus;
    occurredAt?: Date;
  }): AssetVersionCreated {
    return new AssetVersionCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "AssetVersionCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.versionId,
      organizationId: input.organizationId,
      payload: {
        versionId: input.versionId,
        assetId: input.assetId,
        versionNumber: input.versionNumber,
        status: input.status,
      },
    });
  }
}

export class AssetVersionPromoted extends DomainEvent<
  "AssetVersionPromoted",
  Readonly<{
    versionId: string;
    assetId: string;
    previousVersionId: string | null;
  }>
> {
  static create(input: {
    organizationId: string;
    versionId: AssetVersionId;
    assetId: AssetId;
    previousVersionId: AssetVersionId | null;
    occurredAt?: Date;
  }): AssetVersionPromoted {
    return new AssetVersionPromoted({
      eventId: DomainEvent.nextEventId(),
      eventType: "AssetVersionPromoted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.versionId,
      organizationId: input.organizationId,
      payload: {
        versionId: input.versionId,
        assetId: input.assetId,
        previousVersionId: input.previousVersionId,
      },
    });
  }
}

export class CollectionCreated extends DomainEvent<
  "CollectionCreated",
  Readonly<{ collectionId: string; name: string }>
> {
  static create(input: {
    organizationId: string;
    collectionId: AssetCollectionId;
    name: string;
    occurredAt?: Date;
  }): CollectionCreated {
    return new CollectionCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "CollectionCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.collectionId,
      organizationId: input.organizationId,
      payload: { collectionId: input.collectionId, name: input.name },
    });
  }
}

export class CollectionArchived extends DomainEvent<
  "CollectionArchived",
  Readonly<{ collectionId: string }>
> {
  static create(input: {
    organizationId: string;
    collectionId: AssetCollectionId;
    occurredAt?: Date;
  }): CollectionArchived {
    return new CollectionArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "CollectionArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.collectionId,
      organizationId: input.organizationId,
      payload: { collectionId: input.collectionId },
    });
  }
}

export class AssetAddedToCollection extends DomainEvent<
  "AssetAddedToCollection",
  Readonly<{ collectionId: string; assetId: string }>
> {
  static create(input: {
    organizationId: string;
    collectionId: AssetCollectionId;
    assetId: AssetId;
    occurredAt?: Date;
  }): AssetAddedToCollection {
    return new AssetAddedToCollection({
      eventId: DomainEvent.nextEventId(),
      eventType: "AssetAddedToCollection",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.collectionId,
      organizationId: input.organizationId,
      payload: {
        collectionId: input.collectionId,
        assetId: input.assetId,
      },
    });
  }
}

export class AssetRemovedFromCollection extends DomainEvent<
  "AssetRemovedFromCollection",
  Readonly<{ collectionId: string; assetId: string }>
> {
  static create(input: {
    organizationId: string;
    collectionId: AssetCollectionId;
    assetId: AssetId;
    occurredAt?: Date;
  }): AssetRemovedFromCollection {
    return new AssetRemovedFromCollection({
      eventId: DomainEvent.nextEventId(),
      eventType: "AssetRemovedFromCollection",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.collectionId,
      organizationId: input.organizationId,
      payload: {
        collectionId: input.collectionId,
        assetId: input.assetId,
      },
    });
  }
}

export class RelationshipCreated extends DomainEvent<
  "RelationshipCreated",
  Readonly<{
    relationshipId: string;
    sourceAssetId: string;
    targetAssetId: string;
    relationshipType: RelationshipType;
  }>
> {
  static create(input: {
    organizationId: string;
    relationshipId: AssetRelationshipId;
    sourceAssetId: AssetId;
    targetAssetId: AssetId;
    relationshipType: RelationshipType;
    occurredAt?: Date;
  }): RelationshipCreated {
    return new RelationshipCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "RelationshipCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.relationshipId,
      organizationId: input.organizationId,
      payload: {
        relationshipId: input.relationshipId,
        sourceAssetId: input.sourceAssetId,
        targetAssetId: input.targetAssetId,
        relationshipType: input.relationshipType,
      },
    });
  }
}

export class RelationshipRemoved extends DomainEvent<
  "RelationshipRemoved",
  Readonly<{ relationshipId: string }>
> {
  static create(input: {
    organizationId: string;
    relationshipId: AssetRelationshipId;
    occurredAt?: Date;
  }): RelationshipRemoved {
    return new RelationshipRemoved({
      eventId: DomainEvent.nextEventId(),
      eventType: "RelationshipRemoved",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.relationshipId,
      organizationId: input.organizationId,
      payload: { relationshipId: input.relationshipId },
    });
  }
}
