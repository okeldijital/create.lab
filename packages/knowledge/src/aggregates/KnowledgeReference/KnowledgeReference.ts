import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { ReferenceStatus } from "../../enums/ReferenceStatus.js";
import { RelationshipType } from "../../enums/RelationshipType.js";
import {
  InvalidKnowledgeStateError,
  KnowledgeValidationError,
} from "../../errors/KnowledgeErrors.js";
import {
  KnowledgeReferenceCreated,
  KnowledgeReferenceRemoved,
} from "../../events/knowledge-events.js";
import {
  asKnowledgeReferenceId,
  type KnowledgeArticleId,
  type KnowledgeReferenceId,
} from "../../types/ids.js";
import { ReferenceLabel } from "../../value-objects/ReferenceLabel.js";

export type CreateKnowledgeReferenceProps = {
  organizationId: OrganizationId;
  sourceArticleId: KnowledgeArticleId;
  targetArticleId: KnowledgeArticleId;
  relationshipType: RelationshipType;
  label?: string | null;
  id?: string;
  now?: Date;
};

export type KnowledgeReferenceSnapshot = {
  id: KnowledgeReferenceId;
  organizationId: OrganizationId;
  sourceArticleId: KnowledgeArticleId;
  targetArticleId: KnowledgeArticleId;
  relationshipType: RelationshipType;
  label: string | null;
  status: ReferenceStatus;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Directed knowledge relationship. Identity immutable after create.
 */
export class KnowledgeReference extends AggregateRoot<KnowledgeReferenceId> {
  private constructor(
    id: KnowledgeReferenceId,
    private readonly _organizationId: OrganizationId,
    private readonly _sourceArticleId: KnowledgeArticleId,
    private readonly _targetArticleId: KnowledgeArticleId,
    private readonly _relationshipType: RelationshipType,
    private readonly _label: ReferenceLabel,
    private _status: ReferenceStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateKnowledgeReferenceProps): KnowledgeReference {
    if (!props.sourceArticleId || !props.targetArticleId) {
      throw new KnowledgeValidationError(
        "Reference requires source and target articles.",
      );
    }
    if (props.sourceArticleId === props.targetArticleId) {
      throw new KnowledgeValidationError(
        "Knowledge reference cannot be self-referential.",
      );
    }
    if (!Object.values(RelationshipType).includes(props.relationshipType)) {
      throw new KnowledgeValidationError(
        `Invalid relationship type: ${String(props.relationshipType)}`,
      );
    }
    const now = props.now ?? new Date();
    const id = asKnowledgeReferenceId(props.id ?? generateId());
    const ref = new KnowledgeReference(
      id,
      props.organizationId,
      props.sourceArticleId,
      props.targetArticleId,
      props.relationshipType,
      ReferenceLabel.create(props.label),
      ReferenceStatus.ACTIVE,
      now,
      now,
    );
    ref.record(
      KnowledgeReferenceCreated.create({
        organizationId: props.organizationId,
        referenceId: id,
        sourceArticleId: props.sourceArticleId,
        targetArticleId: props.targetArticleId,
        relationshipType: props.relationshipType,
        occurredAt: now,
      }),
    );
    return ref;
  }

  static reconstitute(
    snapshot: KnowledgeReferenceSnapshot,
  ): KnowledgeReference {
    return new KnowledgeReference(
      snapshot.id,
      snapshot.organizationId,
      snapshot.sourceArticleId,
      snapshot.targetArticleId,
      snapshot.relationshipType,
      ReferenceLabel.create(snapshot.label),
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get sourceArticleId(): KnowledgeArticleId {
    return this._sourceArticleId;
  }
  get targetArticleId(): KnowledgeArticleId {
    return this._targetArticleId;
  }
  get relationshipType(): RelationshipType {
    return this._relationshipType;
  }
  get label(): ReferenceLabel {
    return this._label;
  }
  get status(): ReferenceStatus {
    return this._status;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isActive(): boolean {
    return this._status === ReferenceStatus.ACTIVE;
  }

  remove(now: Date = new Date()): void {
    if (this._status === ReferenceStatus.REMOVED) {
      throw new InvalidKnowledgeStateError("Reference already removed.");
    }
    this._status = ReferenceStatus.REMOVED;
    this._updatedAt = now;
    this.record(
      KnowledgeReferenceRemoved.create({
        organizationId: this._organizationId,
        referenceId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): KnowledgeReferenceSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      sourceArticleId: this._sourceArticleId,
      targetArticleId: this._targetArticleId,
      relationshipType: this._relationshipType,
      label: this._label.value,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
