import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { AssetVersionStatus } from "../../enums/AssetVersionStatus.js";
import { InvalidVersionError } from "../../errors/AssetErrors.js";
import { AssetVersionCreated } from "../../events/asset-events.js";
import {
  asAssetVersionId,
  type AssetId,
  type AssetVersionId,
} from "../../types/ids.js";
import { Checksum } from "../../value-objects/Checksum.js";
import { Metadata } from "../../value-objects/Metadata.js";
import { VersionNumber } from "../../value-objects/VersionNumber.js";

export type CreateAssetVersionProps = {
  organizationId: OrganizationId;
  assetId: AssetId;
  versionNumber: number;
  checksum: string;
  metadata?: Record<string, string | number | boolean | null> | null;
  createdBy: string;
  /** First version is CURRENT; subsequent typically SUPERSEDED until promoted */
  status?: AssetVersionStatus;
  id?: string;
  now?: Date;
  skipEvent?: boolean;
};

export type AssetVersionSnapshot = {
  id: AssetVersionId;
  organizationId: OrganizationId;
  assetId: AssetId;
  versionNumber: number;
  checksum: string;
  metadata: Record<string, string | number | boolean | null>;
  createdBy: string;
  createdAt: Date;
  status: AssetVersionStatus;
};

/**
 * Immutable revision of an asset. No binary data or file paths.
 */
export class AssetVersion extends AggregateRoot<AssetVersionId> {
  private constructor(
    id: AssetVersionId,
    private readonly _organizationId: OrganizationId,
    private readonly _assetId: AssetId,
    private readonly _versionNumber: VersionNumber,
    private readonly _checksum: Checksum,
    private readonly _metadata: Metadata,
    private readonly _createdBy: string,
    private readonly _createdAt: Date,
    private _status: AssetVersionStatus,
  ) {
    super(id);
  }

  static create(props: CreateAssetVersionProps): AssetVersion {
    if (!props.assetId) {
      throw new InvalidVersionError("Version requires an asset.");
    }
    const createdBy = props.createdBy?.trim();
    if (!createdBy) {
      throw new InvalidVersionError("Version requires createdBy.");
    }
    const now = props.now ?? new Date();
    const id = asAssetVersionId(props.id ?? generateId());
    const status = props.status ?? AssetVersionStatus.CURRENT;
    const version = new AssetVersion(
      id,
      props.organizationId,
      props.assetId,
      VersionNumber.create(props.versionNumber),
      Checksum.create(props.checksum),
      Metadata.create(props.metadata),
      createdBy,
      now,
      status,
    );
    if (!props.skipEvent) {
      version.record(
        AssetVersionCreated.create({
          organizationId: props.organizationId,
          versionId: id,
          assetId: props.assetId,
          versionNumber: props.versionNumber,
          status,
          occurredAt: now,
        }),
      );
    }
    return version;
  }

  static reconstitute(snapshot: AssetVersionSnapshot): AssetVersion {
    return new AssetVersion(
      snapshot.id,
      snapshot.organizationId,
      snapshot.assetId,
      VersionNumber.create(snapshot.versionNumber),
      Checksum.create(snapshot.checksum),
      Metadata.create(snapshot.metadata),
      snapshot.createdBy,
      new Date(snapshot.createdAt),
      snapshot.status,
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get assetId(): AssetId {
    return this._assetId;
  }
  get versionNumber(): VersionNumber {
    return this._versionNumber;
  }
  get checksum(): Checksum {
    return this._checksum;
  }
  get metadata(): Metadata {
    return this._metadata;
  }
  get createdBy(): string {
    return this._createdBy;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get status(): AssetVersionStatus {
    return this._status;
  }
  get isCurrent(): boolean {
    return this._status === AssetVersionStatus.CURRENT;
  }

  /**
   * Status transition only — identity/checksum/metadata remain immutable.
   */
  markSuperseded(): void {
    if (this._status === AssetVersionStatus.SUPERSEDED) return;
    this._status = AssetVersionStatus.SUPERSEDED;
  }

  markCurrent(): void {
    this._status = AssetVersionStatus.CURRENT;
  }

  toSnapshot(): AssetVersionSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      assetId: this._assetId,
      versionNumber: this._versionNumber.value,
      checksum: this._checksum.value,
      metadata: { ...this._metadata.entries },
      createdBy: this._createdBy,
      createdAt: this.createdAt,
      status: this._status,
    };
  }
}
