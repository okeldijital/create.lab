import { AggregateRoot, generateId } from "@creative-lab/core";
import type { AssetId, AssetVersionId } from "@creative-lab/assets";
import type { OrganizationId } from "@creative-lab/organization";
import { InvalidDeliveryStateError } from "../../errors/DeliveryErrors.js";
import { ItemAdded } from "../../events/delivery-events.js";
import {
  asDeliveryItemId,
  type DeliveryItemId,
  type DeliveryPackageId,
} from "../../types/ids.js";
import { DeliveryNotes } from "../../value-objects/DeliveryNotes.js";
import { PackageName } from "../../value-objects/PackageName.js";

export type CreateDeliveryItemProps = {
  organizationId: OrganizationId;
  packageId: DeliveryPackageId;
  assetId: AssetId;
  assetVersionId: AssetVersionId;
  name: string;
  notes?: string | null;
  id?: string;
  now?: Date;
  skipEvent?: boolean;
};

export type DeliveryItemSnapshot = {
  id: DeliveryItemId;
  organizationId: OrganizationId;
  packageId: DeliveryPackageId;
  assetId: AssetId;
  assetVersionId: AssetVersionId;
  name: string;
  notes: string | null;
  removed: boolean;
  createdAt: Date;
};

/**
 * Single deliverable reference — asset + version IDs only.
 * No storage, URL, path, or blob.
 */
export class DeliveryItem extends AggregateRoot<DeliveryItemId> {
  private constructor(
    id: DeliveryItemId,
    private readonly _organizationId: OrganizationId,
    private readonly _packageId: DeliveryPackageId,
    private readonly _assetId: AssetId,
    private readonly _assetVersionId: AssetVersionId,
    private readonly _name: PackageName,
    private readonly _notes: DeliveryNotes,
    private _removed: boolean,
    private readonly _createdAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateDeliveryItemProps): DeliveryItem {
    if (!props.packageId) {
      throw new InvalidDeliveryStateError("Item requires a package.");
    }
    if (!props.assetId) {
      throw new InvalidDeliveryStateError("Item requires an asset reference.");
    }
    if (!props.assetVersionId) {
      throw new InvalidDeliveryStateError(
        "Item requires an asset version reference.",
      );
    }
    const now = props.now ?? new Date();
    const id = asDeliveryItemId(props.id ?? generateId());
    const item = new DeliveryItem(
      id,
      props.organizationId,
      props.packageId,
      props.assetId,
      props.assetVersionId,
      PackageName.create(props.name),
      DeliveryNotes.create(props.notes),
      false,
      now,
    );
    if (!props.skipEvent) {
      item.record(
        ItemAdded.create({
          organizationId: props.organizationId,
          itemId: id,
          packageId: props.packageId,
          assetId: props.assetId,
          assetVersionId: props.assetVersionId,
          occurredAt: now,
        }),
      );
    }
    return item;
  }

  static reconstitute(snapshot: DeliveryItemSnapshot): DeliveryItem {
    return new DeliveryItem(
      snapshot.id,
      snapshot.organizationId,
      snapshot.packageId,
      snapshot.assetId,
      snapshot.assetVersionId,
      PackageName.create(snapshot.name),
      DeliveryNotes.create(snapshot.notes),
      snapshot.removed,
      new Date(snapshot.createdAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get packageId(): DeliveryPackageId {
    return this._packageId;
  }
  get assetId(): AssetId {
    return this._assetId;
  }
  get assetVersionId(): AssetVersionId {
    return this._assetVersionId;
  }
  get name(): PackageName {
    return this._name;
  }
  get notes(): DeliveryNotes {
    return this._notes;
  }
  get removed(): boolean {
    return this._removed;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get isActive(): boolean {
    return !this._removed;
  }

  markRemoved(): void {
    if (this._removed) {
      throw new InvalidDeliveryStateError("Item already removed.");
    }
    this._removed = true;
  }

  toSnapshot(): DeliveryItemSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      packageId: this._packageId,
      assetId: this._assetId,
      assetVersionId: this._assetVersionId,
      name: this._name.value,
      notes: this._notes.value,
      removed: this._removed,
      createdAt: this.createdAt,
    };
  }
}
