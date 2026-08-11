import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import type { CapacityUnit } from "../../enums/CapacityUnit.js";
import {
  CapacityProfileValidationError,
  ResourceCapacityConflictError,
} from "../../errors/CapacityErrors.js";
import { ResourceCapacityUpdated } from "../../events/capacity-events.js";
import {
  asResourceCapacityId,
  type CapacityProfileId,
  type ResourceCapacityId,
} from "../../types/ids.js";
import { isBeforeDay, startOfUtcDay } from "../../utils/dates.js";
import { CapacityQuantity } from "../../value-objects/CapacityQuantity.js";

export type CreateResourceCapacityProps = {
  organizationId: OrganizationId;
  capacityProfileId: CapacityProfileId;
  capacityType: string;
  quantity: number;
  unit: CapacityUnit;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
  id?: string;
  now?: Date;
};

export type ResourceCapacitySnapshot = {
  id: ResourceCapacityId;
  organizationId: OrganizationId;
  capacityProfileId: CapacityProfileId;
  capacityType: string;
  quantity: number;
  unit: CapacityUnit;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class ResourceCapacity extends AggregateRoot<ResourceCapacityId> {
  private constructor(
    id: ResourceCapacityId,
    private readonly _organizationId: OrganizationId,
    private readonly _capacityProfileId: CapacityProfileId,
    private _capacityType: string,
    private _quantity: CapacityQuantity,
    private _effectiveFrom: Date,
    private _effectiveTo: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateResourceCapacityProps): ResourceCapacity {
    const capacityType = props.capacityType?.trim();
    if (!capacityType) {
      throw new CapacityProfileValidationError("Capacity type is required.");
    }
    const quantity = CapacityQuantity.create(props.quantity, props.unit);
    const effectiveFrom = startOfUtcDay(
      props.effectiveFrom ?? props.now ?? new Date(),
    );
    const effectiveTo = props.effectiveTo
      ? startOfUtcDay(props.effectiveTo)
      : null;
    if (effectiveTo && isBeforeDay(effectiveTo, effectiveFrom)) {
      throw new ResourceCapacityConflictError(
        "Effective end cannot precede effective start.",
      );
    }
    const now = props.now ?? new Date();
    const id = asResourceCapacityId(props.id ?? generateId());

    const capacity = new ResourceCapacity(
      id,
      props.organizationId,
      props.capacityProfileId,
      capacityType,
      quantity,
      effectiveFrom,
      effectiveTo,
      now,
      now,
    );

    capacity.record(
      ResourceCapacityUpdated.create({
        organizationId: props.organizationId,
        resourceCapacityId: id,
        capacityProfileId: props.capacityProfileId,
        quantity: quantity.quantity,
        unit: quantity.unit,
        occurredAt: now,
      }),
    );

    return capacity;
  }

  static reconstitute(snapshot: ResourceCapacitySnapshot): ResourceCapacity {
    return new ResourceCapacity(
      snapshot.id,
      snapshot.organizationId,
      snapshot.capacityProfileId,
      snapshot.capacityType,
      CapacityQuantity.create(snapshot.quantity, snapshot.unit),
      new Date(snapshot.effectiveFrom),
      snapshot.effectiveTo ? new Date(snapshot.effectiveTo) : null,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get capacityProfileId(): CapacityProfileId {
    return this._capacityProfileId;
  }
  get capacityType(): string {
    return this._capacityType;
  }
  get quantity(): CapacityQuantity {
    return this._quantity;
  }
  get effectiveFrom(): Date {
    return new Date(this._effectiveFrom);
  }
  get effectiveTo(): Date | null {
    return this._effectiveTo ? new Date(this._effectiveTo) : null;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  update(props: {
    quantity?: number;
    unit?: CapacityUnit;
    capacityType?: string;
    effectiveFrom?: Date;
    effectiveTo?: Date | null;
    now?: Date;
  }): void {
    const now = props.now ?? new Date();
    if (props.capacityType !== undefined) {
      const capacityType = props.capacityType.trim();
      if (!capacityType) {
        throw new CapacityProfileValidationError("Capacity type is required.");
      }
      this._capacityType = capacityType;
    }
    if (props.quantity !== undefined || props.unit !== undefined) {
      this._quantity = CapacityQuantity.create(
        props.quantity ?? this._quantity.quantity,
        props.unit ?? this._quantity.unit,
      );
    }
    if (props.effectiveFrom !== undefined) {
      this._effectiveFrom = startOfUtcDay(props.effectiveFrom);
    }
    if (props.effectiveTo !== undefined) {
      this._effectiveTo = props.effectiveTo
        ? startOfUtcDay(props.effectiveTo)
        : null;
    }
    if (
      this._effectiveTo &&
      isBeforeDay(this._effectiveTo, this._effectiveFrom)
    ) {
      throw new ResourceCapacityConflictError(
        "Effective end cannot precede effective start.",
      );
    }
    this._updatedAt = now;
    this.record(
      ResourceCapacityUpdated.create({
        organizationId: this._organizationId,
        resourceCapacityId: this.id,
        capacityProfileId: this._capacityProfileId,
        quantity: this._quantity.quantity,
        unit: this._quantity.unit,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): ResourceCapacitySnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      capacityProfileId: this._capacityProfileId,
      capacityType: this._capacityType,
      quantity: this._quantity.quantity,
      unit: this._quantity.unit,
      effectiveFrom: new Date(this._effectiveFrom),
      effectiveTo: this._effectiveTo ? new Date(this._effectiveTo) : null,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
