import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { PackageStatus } from "../../enums/PackageStatus.js";
import {
  InvalidDeliveryStateError,
  PackageAlreadySealedError,
} from "../../errors/DeliveryErrors.js";
import {
  PackageArchived,
  PackageCreated,
  PackageSealed,
} from "../../events/delivery-events.js";
import {
  asDeliveryPackageId,
  type DeliveryId,
  type DeliveryItemId,
  type DeliveryPackageId,
} from "../../types/ids.js";
import { uniqueIds } from "../../utils/index.js";
import { PackageDescription } from "../../value-objects/PackageDescription.js";
import { PackageName } from "../../value-objects/PackageName.js";

export type CreateDeliveryPackageProps = {
  organizationId: OrganizationId;
  deliveryId: DeliveryId;
  name: string;
  description?: string | null;
  itemIds?: readonly DeliveryItemId[];
  id?: string;
  now?: Date;
};

export type DeliveryPackageSnapshot = {
  id: DeliveryPackageId;
  organizationId: OrganizationId;
  deliveryId: DeliveryId;
  name: string;
  description: string | null;
  itemIds: string[];
  status: PackageStatus;
  createdAt: Date;
  updatedAt: Date;
};

export class DeliveryPackage extends AggregateRoot<DeliveryPackageId> {
  private constructor(
    id: DeliveryPackageId,
    private readonly _organizationId: OrganizationId,
    private readonly _deliveryId: DeliveryId,
    private _name: PackageName,
    private _description: PackageDescription,
    private _itemIds: DeliveryItemId[],
    private _status: PackageStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateDeliveryPackageProps): DeliveryPackage {
    if (!props.deliveryId) {
      throw new InvalidDeliveryStateError("Package requires a delivery.");
    }
    const now = props.now ?? new Date();
    const id = asDeliveryPackageId(props.id ?? generateId());
    const pkg = new DeliveryPackage(
      id,
      props.organizationId,
      props.deliveryId,
      PackageName.create(props.name),
      PackageDescription.create(props.description),
      uniqueIds(props.itemIds ?? []),
      PackageStatus.OPEN,
      now,
      now,
    );
    pkg.record(
      PackageCreated.create({
        organizationId: props.organizationId,
        packageId: id,
        deliveryId: props.deliveryId,
        name: pkg._name.value,
        occurredAt: now,
      }),
    );
    return pkg;
  }

  static reconstitute(snapshot: DeliveryPackageSnapshot): DeliveryPackage {
    return new DeliveryPackage(
      snapshot.id,
      snapshot.organizationId,
      snapshot.deliveryId,
      PackageName.create(snapshot.name),
      PackageDescription.create(snapshot.description),
      snapshot.itemIds as DeliveryItemId[],
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get deliveryId(): DeliveryId {
    return this._deliveryId;
  }
  get name(): PackageName {
    return this._name;
  }
  get description(): PackageDescription {
    return this._description;
  }
  get itemIds(): readonly DeliveryItemId[] {
    return [...this._itemIds];
  }
  get status(): PackageStatus {
    return this._status;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isSealed(): boolean {
    return this._status === PackageStatus.SEALED;
  }
  get isArchived(): boolean {
    return this._status === PackageStatus.ARCHIVED;
  }

  rename(name: string, now: Date = new Date()): void {
    this.assertOpen();
    this._name = PackageName.create(name);
    this._updatedAt = now;
  }

  addItem(itemId: DeliveryItemId, now: Date = new Date()): void {
    this.assertOpen();
    if (!itemId) {
      throw new InvalidDeliveryStateError("Item id is required.");
    }
    if (this._itemIds.includes(itemId)) return;
    this._itemIds = [...this._itemIds, itemId];
    this._updatedAt = now;
  }

  removeItem(itemId: DeliveryItemId, now: Date = new Date()): void {
    this.assertOpen();
    this._itemIds = this._itemIds.filter((id) => id !== itemId);
    this._updatedAt = now;
  }

  seal(now: Date = new Date()): void {
    this.assertOpen();
    if (this._itemIds.length === 0) {
      throw new InvalidDeliveryStateError(
        "Cannot seal package without at least one item.",
      );
    }
    this._status = PackageStatus.SEALED;
    this._updatedAt = now;
    this.record(
      PackageSealed.create({
        organizationId: this._organizationId,
        packageId: this.id,
        deliveryId: this._deliveryId,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === PackageStatus.ARCHIVED) {
      throw new InvalidDeliveryStateError("Package already archived.");
    }
    if (this._status === PackageStatus.OPEN) {
      throw new InvalidDeliveryStateError(
        "Cannot archive an open package; seal first.",
      );
    }
    this._status = PackageStatus.ARCHIVED;
    this._updatedAt = now;
    this.record(
      PackageArchived.create({
        organizationId: this._organizationId,
        packageId: this.id,
        occurredAt: now,
      }),
    );
  }

  contains(itemId: DeliveryItemId): boolean {
    return this._itemIds.includes(itemId);
  }

  toSnapshot(): DeliveryPackageSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      deliveryId: this._deliveryId,
      name: this._name.value,
      description: this._description.value,
      itemIds: this._itemIds.map(String),
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private assertOpen(): void {
    if (this._status === PackageStatus.SEALED) {
      throw new PackageAlreadySealedError(this.id);
    }
    if (this._status === PackageStatus.ARCHIVED) {
      throw new InvalidDeliveryStateError(
        "Archived packages are immutable.",
      );
    }
  }
}
