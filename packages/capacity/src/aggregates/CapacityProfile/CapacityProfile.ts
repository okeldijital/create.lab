import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { CapacityStatus } from "../../enums/CapacityStatus.js";
import { ResourceType } from "../../enums/ResourceType.js";
import {
  CapacityProfileValidationError,
} from "../../errors/CapacityErrors.js";
import {
  CapacityProfileArchived,
  CapacityProfileCreated,
  CapacityProfileUpdated,
} from "../../events/capacity-events.js";
import {
  asCapacityProfileId,
  type AvailabilityProfileId,
  type CapacityProfileId,
  type ResourceId,
  type WorkingPatternId,
} from "../../types/ids.js";
import { isBeforeDay, startOfUtcDay } from "../../utils/dates.js";

export type CreateCapacityProfileProps = {
  organizationId: OrganizationId;
  resourceId: ResourceId;
  resourceType: ResourceType;
  availabilityProfileId?: AvailabilityProfileId | null;
  workingPatternId?: WorkingPatternId | null;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
  id?: string;
  now?: Date;
};

export type CapacityProfileSnapshot = {
  id: CapacityProfileId;
  organizationId: OrganizationId;
  resourceId: ResourceId;
  resourceType: ResourceType;
  availabilityProfileId: AvailabilityProfileId | null;
  workingPatternId: WorkingPatternId | null;
  status: CapacityStatus;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class CapacityProfile extends AggregateRoot<CapacityProfileId> {
  private constructor(
    id: CapacityProfileId,
    private readonly _organizationId: OrganizationId,
    private readonly _resourceId: ResourceId,
    private readonly _resourceType: ResourceType,
    private _availabilityProfileId: AvailabilityProfileId | null,
    private _workingPatternId: WorkingPatternId | null,
    private _status: CapacityStatus,
    private _effectiveFrom: Date,
    private _effectiveTo: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateCapacityProfileProps): CapacityProfile {
    if (!Object.values(ResourceType).includes(props.resourceType)) {
      throw new CapacityProfileValidationError(
        `Invalid resource type: ${String(props.resourceType)}`,
      );
    }
    const effectiveFrom = startOfUtcDay(props.effectiveFrom ?? props.now ?? new Date());
    const effectiveTo = props.effectiveTo
      ? startOfUtcDay(props.effectiveTo)
      : null;
    if (effectiveTo && isBeforeDay(effectiveTo, effectiveFrom)) {
      throw new CapacityProfileValidationError(
        "Effective end date cannot precede effective start date.",
      );
    }
    const now = props.now ?? new Date();
    const id = asCapacityProfileId(props.id ?? generateId());

    const profile = new CapacityProfile(
      id,
      props.organizationId,
      props.resourceId,
      props.resourceType,
      props.availabilityProfileId ?? null,
      props.workingPatternId ?? null,
      CapacityStatus.ACTIVE,
      effectiveFrom,
      effectiveTo,
      now,
      now,
    );

    profile.record(
      CapacityProfileCreated.create({
        organizationId: props.organizationId,
        capacityProfileId: id,
        resourceId: props.resourceId,
        resourceType: props.resourceType,
        status: CapacityStatus.ACTIVE,
        occurredAt: now,
      }),
    );

    return profile;
  }

  static reconstitute(snapshot: CapacityProfileSnapshot): CapacityProfile {
    return new CapacityProfile(
      snapshot.id,
      snapshot.organizationId,
      snapshot.resourceId,
      snapshot.resourceType,
      snapshot.availabilityProfileId,
      snapshot.workingPatternId,
      snapshot.status,
      new Date(snapshot.effectiveFrom),
      snapshot.effectiveTo ? new Date(snapshot.effectiveTo) : null,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get resourceId(): ResourceId {
    return this._resourceId;
  }
  get resourceType(): ResourceType {
    return this._resourceType;
  }
  get availabilityProfileId(): AvailabilityProfileId | null {
    return this._availabilityProfileId;
  }
  get workingPatternId(): WorkingPatternId | null {
    return this._workingPatternId;
  }
  get status(): CapacityStatus {
    return this._status;
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
  get isActive(): boolean {
    return this._status === CapacityStatus.ACTIVE;
  }
  get isArchived(): boolean {
    return this._status === CapacityStatus.ARCHIVED;
  }

  update(props: {
    availabilityProfileId?: AvailabilityProfileId | null;
    workingPatternId?: WorkingPatternId | null;
    status?: CapacityStatus;
    effectiveFrom?: Date;
    effectiveTo?: Date | null;
    now?: Date;
  }): void {
    if (this.isArchived) {
      throw new CapacityProfileValidationError(
        "Archived capacity profile cannot be modified.",
      );
    }
    const now = props.now ?? new Date();
    if (props.availabilityProfileId !== undefined) {
      this._availabilityProfileId = props.availabilityProfileId;
    }
    if (props.workingPatternId !== undefined) {
      this._workingPatternId = props.workingPatternId;
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
      throw new CapacityProfileValidationError(
        "Effective end date cannot precede effective start date.",
      );
    }
    if (props.status !== undefined) {
      if (props.status === CapacityStatus.ARCHIVED) {
        this.archive(now);
        return;
      }
      this._status = props.status;
    }
    this._updatedAt = now;
    this.record(
      CapacityProfileUpdated.create({
        organizationId: this._organizationId,
        capacityProfileId: this.id,
        status: this._status,
        availabilityProfileId: this._availabilityProfileId,
        workingPatternId: this._workingPatternId,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this.isArchived) {
      throw new CapacityProfileValidationError(
        "Capacity profile is already archived.",
      );
    }
    this._status = CapacityStatus.ARCHIVED;
    this._updatedAt = now;
    this.record(
      CapacityProfileArchived.create({
        organizationId: this._organizationId,
        capacityProfileId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): CapacityProfileSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      resourceId: this._resourceId,
      resourceType: this._resourceType,
      availabilityProfileId: this._availabilityProfileId,
      workingPatternId: this._workingPatternId,
      status: this._status,
      effectiveFrom: new Date(this._effectiveFrom),
      effectiveTo: this._effectiveTo ? new Date(this._effectiveTo) : null,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
