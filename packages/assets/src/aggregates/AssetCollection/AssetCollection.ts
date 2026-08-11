import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { InvalidAssetStateError } from "../../errors/AssetErrors.js";
import {
  AssetAddedToCollection,
  AssetRemovedFromCollection,
  CollectionArchived,
  CollectionCreated,
} from "../../events/asset-events.js";
import {
  asAssetCollectionId,
  type AssetCollectionId,
  type AssetId,
} from "../../types/ids.js";
import { uniqueIds } from "../../utils/index.js";
import { AssetDescription } from "../../value-objects/AssetDescription.js";
import { CollectionName } from "../../value-objects/CollectionName.js";

export type CreateAssetCollectionProps = {
  organizationId: OrganizationId;
  name: string;
  description?: string | null;
  assetIds?: readonly AssetId[];
  id?: string;
  now?: Date;
};

export type AssetCollectionSnapshot = {
  id: AssetCollectionId;
  organizationId: OrganizationId;
  name: string;
  description: string | null;
  assetIds: string[];
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class AssetCollection extends AggregateRoot<AssetCollectionId> {
  private constructor(
    id: AssetCollectionId,
    private readonly _organizationId: OrganizationId,
    private _name: CollectionName,
    private _description: AssetDescription,
    private _assetIds: AssetId[],
    private _archived: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateAssetCollectionProps): AssetCollection {
    const now = props.now ?? new Date();
    const id = asAssetCollectionId(props.id ?? generateId());
    const collection = new AssetCollection(
      id,
      props.organizationId,
      CollectionName.create(props.name),
      AssetDescription.create(props.description),
      uniqueIds(props.assetIds ?? []),
      false,
      now,
      now,
    );
    collection.record(
      CollectionCreated.create({
        organizationId: props.organizationId,
        collectionId: id,
        name: collection._name.value,
        occurredAt: now,
      }),
    );
    return collection;
  }

  static reconstitute(snapshot: AssetCollectionSnapshot): AssetCollection {
    return new AssetCollection(
      snapshot.id,
      snapshot.organizationId,
      CollectionName.create(snapshot.name),
      AssetDescription.create(snapshot.description),
      snapshot.assetIds as AssetId[],
      snapshot.archived,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get name(): CollectionName {
    return this._name;
  }
  get description(): AssetDescription {
    return this._description;
  }
  get assetIds(): readonly AssetId[] {
    return [...this._assetIds];
  }
  get archived(): boolean {
    return this._archived;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  rename(name: string, now: Date = new Date()): void {
    this.assertMutable();
    this._name = CollectionName.create(name);
    this._updatedAt = now;
  }

  addAsset(assetId: AssetId, now: Date = new Date()): void {
    this.assertMutable();
    if (!assetId) {
      throw new InvalidAssetStateError("Asset id is required.");
    }
    if (this._assetIds.includes(assetId)) return;
    this._assetIds = [...this._assetIds, assetId];
    this._updatedAt = now;
    this.record(
      AssetAddedToCollection.create({
        organizationId: this._organizationId,
        collectionId: this.id,
        assetId,
        occurredAt: now,
      }),
    );
  }

  removeAsset(assetId: AssetId, now: Date = new Date()): void {
    this.assertMutable();
    if (!this._assetIds.includes(assetId)) return;
    this._assetIds = this._assetIds.filter((id) => id !== assetId);
    this._updatedAt = now;
    this.record(
      AssetRemovedFromCollection.create({
        organizationId: this._organizationId,
        collectionId: this.id,
        assetId,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    this.assertMutable();
    this._archived = true;
    this._updatedAt = now;
    this.record(
      CollectionArchived.create({
        organizationId: this._organizationId,
        collectionId: this.id,
        occurredAt: now,
      }),
    );
  }

  contains(assetId: AssetId): boolean {
    return this._assetIds.includes(assetId);
  }

  toSnapshot(): AssetCollectionSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      name: this._name.value,
      description: this._description.value,
      assetIds: this._assetIds.map(String),
      archived: this._archived,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private assertMutable(): void {
    if (this._archived) {
      throw new InvalidAssetStateError(
        "Archived collections are immutable.",
      );
    }
  }
}
