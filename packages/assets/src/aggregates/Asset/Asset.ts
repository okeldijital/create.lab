import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import type { ProductionId } from "@creative-lab/production";
import type { ProjectId } from "@creative-lab/projects";
import { AssetStatus } from "../../enums/AssetStatus.js";
import { AssetType } from "../../enums/AssetType.js";
import {
  CurrentVersionError,
  InvalidAssetStateError,
} from "../../errors/AssetErrors.js";
import {
  AssetArchived,
  AssetCreated,
  AssetRestored,
  AssetUpdated,
  AssetVersionPromoted,
} from "../../events/asset-events.js";
import {
  asAssetId,
  type AssetId,
  type AssetVersionId,
} from "../../types/ids.js";
import { AssetDescription } from "../../value-objects/AssetDescription.js";
import { AssetName } from "../../value-objects/AssetName.js";

export type CreateAssetProps = {
  organizationId: OrganizationId;
  projectId?: ProjectId | null;
  productionId?: ProductionId | null;
  name: string;
  description?: string | null;
  assetType: AssetType;
  /** Initial current version (created together by service). */
  currentVersionId: AssetVersionId;
  createdBy: string;
  id?: string;
  now?: Date;
};

export type AssetSnapshot = {
  id: AssetId;
  organizationId: OrganizationId;
  projectId: ProjectId | null;
  productionId: ProductionId | null;
  name: string;
  description: string | null;
  assetType: AssetType;
  currentVersionId: AssetVersionId;
  status: AssetStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

/**
 * Logical creative asset. Never stores binary data or file paths.
 * Exactly one current version at all times.
 */
export class Asset extends AggregateRoot<AssetId> {
  private constructor(
    id: AssetId,
    private readonly _organizationId: OrganizationId,
    private readonly _projectId: ProjectId | null,
    private readonly _productionId: ProductionId | null,
    private _name: AssetName,
    private _description: AssetDescription,
    private readonly _assetType: AssetType,
    private _currentVersionId: AssetVersionId,
    private _status: AssetStatus,
    private readonly _createdBy: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreateAssetProps): Asset {
    if (!Object.values(AssetType).includes(props.assetType)) {
      throw new InvalidAssetStateError(
        `Invalid asset type: ${String(props.assetType)}`,
      );
    }
    if (!props.currentVersionId) {
      throw new CurrentVersionError(
        "Asset requires exactly one current version.",
      );
    }
    const createdBy = props.createdBy?.trim();
    if (!createdBy) {
      throw new InvalidAssetStateError("Asset requires createdBy.");
    }
    const now = props.now ?? new Date();
    const id = asAssetId(props.id ?? generateId());
    const asset = new Asset(
      id,
      props.organizationId,
      props.projectId ?? null,
      props.productionId ?? null,
      AssetName.create(props.name),
      AssetDescription.create(props.description),
      props.assetType,
      props.currentVersionId,
      AssetStatus.ACTIVE,
      createdBy,
      now,
      now,
      null,
    );
    asset.record(
      AssetCreated.create({
        organizationId: props.organizationId,
        assetId: id,
        name: asset._name.value,
        assetType: props.assetType,
        currentVersionId: props.currentVersionId,
        status: AssetStatus.ACTIVE,
        occurredAt: now,
      }),
    );
    return asset;
  }

  static reconstitute(snapshot: AssetSnapshot): Asset {
    return new Asset(
      snapshot.id,
      snapshot.organizationId,
      snapshot.projectId,
      snapshot.productionId,
      AssetName.create(snapshot.name),
      AssetDescription.create(snapshot.description),
      snapshot.assetType,
      snapshot.currentVersionId,
      snapshot.status,
      snapshot.createdBy,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.archivedAt ? new Date(snapshot.archivedAt) : null,
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get projectId(): ProjectId | null {
    return this._projectId;
  }
  get productionId(): ProductionId | null {
    return this._productionId;
  }
  get name(): AssetName {
    return this._name;
  }
  get description(): AssetDescription {
    return this._description;
  }
  get assetType(): AssetType {
    return this._assetType;
  }
  get currentVersionId(): AssetVersionId {
    return this._currentVersionId;
  }
  get status(): AssetStatus {
    return this._status;
  }
  get createdBy(): string {
    return this._createdBy;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get archivedAt(): Date | null {
    return this._archivedAt ? new Date(this._archivedAt) : null;
  }
  get isArchived(): boolean {
    return this._status === AssetStatus.ARCHIVED;
  }

  rename(name: string, now: Date = new Date()): void {
    this.assertMutable();
    this._name = AssetName.create(name);
    this._updatedAt = now;
    this.record(
      AssetUpdated.create({
        organizationId: this._organizationId,
        assetId: this.id,
        occurredAt: now,
      }),
    );
  }

  updateDescription(
    description: string | null,
    now: Date = new Date(),
  ): void {
    this.assertMutable();
    this._description = AssetDescription.create(description);
    this._updatedAt = now;
    this.record(
      AssetUpdated.create({
        organizationId: this._organizationId,
        assetId: this.id,
        occurredAt: now,
      }),
    );
  }

  promoteVersion(
    versionId: AssetVersionId,
    previousVersionId: AssetVersionId | null = this._currentVersionId,
    now: Date = new Date(),
  ): void {
    this.assertMutable();
    if (!versionId) {
      throw new CurrentVersionError("Current version id is required.");
    }
    if (this._currentVersionId === versionId) return;
    this._currentVersionId = versionId;
    this._updatedAt = now;
    this.record(
      AssetVersionPromoted.create({
        organizationId: this._organizationId,
        versionId,
        assetId: this.id,
        previousVersionId,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === AssetStatus.ARCHIVED) {
      throw new InvalidAssetStateError("Asset is already archived.");
    }
    this._status = AssetStatus.ARCHIVED;
    this._archivedAt = now;
    this._updatedAt = now;
    this.record(
      AssetArchived.create({
        organizationId: this._organizationId,
        assetId: this.id,
        occurredAt: now,
      }),
    );
  }

  restore(now: Date = new Date()): void {
    if (this._status !== AssetStatus.ARCHIVED) {
      throw new InvalidAssetStateError(
        "Only archived assets can be restored.",
      );
    }
    if (!this._currentVersionId) {
      throw new CurrentVersionError(
        "Cannot restore asset without a current version.",
      );
    }
    this._status = AssetStatus.ACTIVE;
    this._archivedAt = null;
    this._updatedAt = now;
    this.record(
      AssetRestored.create({
        organizationId: this._organizationId,
        assetId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): AssetSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      projectId: this._projectId,
      productionId: this._productionId,
      name: this._name.value,
      description: this._description.value,
      assetType: this._assetType,
      currentVersionId: this._currentVersionId,
      status: this._status,
      createdBy: this._createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
    };
  }

  private assertMutable(): void {
    if (this._status === AssetStatus.ARCHIVED) {
      throw new InvalidAssetStateError("Archived assets are immutable.");
    }
  }
}
