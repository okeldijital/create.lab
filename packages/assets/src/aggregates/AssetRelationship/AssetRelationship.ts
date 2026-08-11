import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { RelationshipType } from "../../enums/RelationshipType.js";
import {
  CircularRelationshipError,
  RelationshipError,
} from "../../errors/AssetErrors.js";
import {
  RelationshipCreated,
  RelationshipRemoved,
} from "../../events/asset-events.js";
import {
  asAssetRelationshipId,
  type AssetId,
  type AssetRelationshipId,
} from "../../types/ids.js";
import { RelationshipLabel } from "../../value-objects/RelationshipLabel.js";

export type CreateAssetRelationshipProps = {
  organizationId: OrganizationId;
  sourceAssetId: AssetId;
  targetAssetId: AssetId;
  relationshipType: RelationshipType;
  label?: string | null;
  id?: string;
  now?: Date;
};

export type AssetRelationshipSnapshot = {
  id: AssetRelationshipId;
  organizationId: OrganizationId;
  sourceAssetId: AssetId;
  targetAssetId: AssetId;
  relationshipType: RelationshipType;
  label: string | null;
  removed: boolean;
  createdAt: Date;
};

/**
 * Immutable directed relationship between assets.
 * Removal is soft (historical retention) via removed flag + event.
 */
export class AssetRelationship extends AggregateRoot<AssetRelationshipId> {
  private constructor(
    id: AssetRelationshipId,
    private readonly _organizationId: OrganizationId,
    private readonly _sourceAssetId: AssetId,
    private readonly _targetAssetId: AssetId,
    private readonly _relationshipType: RelationshipType,
    private readonly _label: RelationshipLabel,
    private _removed: boolean,
    private readonly _createdAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateAssetRelationshipProps): AssetRelationship {
    if (!props.sourceAssetId || !props.targetAssetId) {
      throw new RelationshipError(
        "Relationship requires source and target assets.",
      );
    }
    if (props.sourceAssetId === props.targetAssetId) {
      throw new CircularRelationshipError(
        "Asset cannot relate to itself.",
      );
    }
    if (!Object.values(RelationshipType).includes(props.relationshipType)) {
      throw new RelationshipError(
        `Invalid relationship type: ${String(props.relationshipType)}`,
      );
    }
    const now = props.now ?? new Date();
    const id = asAssetRelationshipId(props.id ?? generateId());
    const rel = new AssetRelationship(
      id,
      props.organizationId,
      props.sourceAssetId,
      props.targetAssetId,
      props.relationshipType,
      RelationshipLabel.create(props.label),
      false,
      now,
    );
    rel.record(
      RelationshipCreated.create({
        organizationId: props.organizationId,
        relationshipId: id,
        sourceAssetId: props.sourceAssetId,
        targetAssetId: props.targetAssetId,
        relationshipType: props.relationshipType,
        occurredAt: now,
      }),
    );
    return rel;
  }

  static reconstitute(
    snapshot: AssetRelationshipSnapshot,
  ): AssetRelationship {
    return new AssetRelationship(
      snapshot.id,
      snapshot.organizationId,
      snapshot.sourceAssetId,
      snapshot.targetAssetId,
      snapshot.relationshipType,
      RelationshipLabel.create(snapshot.label),
      snapshot.removed,
      new Date(snapshot.createdAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get sourceAssetId(): AssetId {
    return this._sourceAssetId;
  }
  get targetAssetId(): AssetId {
    return this._targetAssetId;
  }
  get relationshipType(): RelationshipType {
    return this._relationshipType;
  }
  get label(): RelationshipLabel {
    return this._label;
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

  remove(now: Date = new Date()): void {
    if (this._removed) {
      throw new RelationshipError("Relationship is already removed.");
    }
    this._removed = true;
    this.record(
      RelationshipRemoved.create({
        organizationId: this._organizationId,
        relationshipId: this.id,
        occurredAt: now,
      }),
    );
  }

  matches(
    sourceAssetId: AssetId,
    targetAssetId: AssetId,
    relationshipType: RelationshipType,
  ): boolean {
    return (
      this._sourceAssetId === sourceAssetId &&
      this._targetAssetId === targetAssetId &&
      this._relationshipType === relationshipType
    );
  }

  toSnapshot(): AssetRelationshipSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      sourceAssetId: this._sourceAssetId,
      targetAssetId: this._targetAssetId,
      relationshipType: this._relationshipType,
      label: this._label.value,
      removed: this._removed,
      createdAt: this.createdAt,
    };
  }
}
