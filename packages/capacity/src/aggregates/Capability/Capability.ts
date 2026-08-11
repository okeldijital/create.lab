import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import type { CapabilityLevel } from "../../enums/CapabilityLevel.js";
import { CapacityProfileValidationError } from "../../errors/CapacityErrors.js";
import {
  CapabilityAdded,
  CapabilityRemoved,
} from "../../events/capacity-events.js";
import {
  asCapabilityId,
  type CapabilityId,
  type CapacityProfileId,
} from "../../types/ids.js";
import { isBeforeDay, startOfUtcDay } from "../../utils/dates.js";
import { CapabilityName } from "../../value-objects/CapabilityName.js";
import { ProficiencyLevel } from "../../value-objects/ProficiencyLevel.js";

export type CreateCapabilityProps = {
  organizationId: OrganizationId;
  capacityProfileId: CapacityProfileId;
  name: string;
  proficiency: CapabilityLevel;
  certification?: string | null;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
  id?: string;
  now?: Date;
};

export type CapabilitySnapshot = {
  id: CapabilityId;
  organizationId: OrganizationId;
  capacityProfileId: CapacityProfileId;
  name: string;
  proficiency: CapabilityLevel;
  certification: string | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class Capability extends AggregateRoot<CapabilityId> {
  private constructor(
    id: CapabilityId,
    private readonly _organizationId: OrganizationId,
    private readonly _capacityProfileId: CapacityProfileId,
    private _name: CapabilityName,
    private _proficiency: ProficiencyLevel,
    private _certification: string | null,
    private _effectiveFrom: Date,
    private _effectiveTo: Date | null,
    private _active: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateCapabilityProps): Capability {
    const name = CapabilityName.create(props.name);
    const proficiency = ProficiencyLevel.create(props.proficiency);
    const effectiveFrom = startOfUtcDay(
      props.effectiveFrom ?? props.now ?? new Date(),
    );
    const effectiveTo = props.effectiveTo
      ? startOfUtcDay(props.effectiveTo)
      : null;
    if (effectiveTo && isBeforeDay(effectiveTo, effectiveFrom)) {
      throw new CapacityProfileValidationError(
        "Capability effective end cannot precede start.",
      );
    }
    const now = props.now ?? new Date();
    const id = asCapabilityId(props.id ?? generateId());

    const capability = new Capability(
      id,
      props.organizationId,
      props.capacityProfileId,
      name,
      proficiency,
      props.certification?.trim() || null,
      effectiveFrom,
      effectiveTo,
      true,
      now,
      now,
    );

    capability.record(
      CapabilityAdded.create({
        organizationId: props.organizationId,
        capabilityId: id,
        capacityProfileId: props.capacityProfileId,
        name: name.value,
        proficiency: proficiency.level,
        occurredAt: now,
      }),
    );

    return capability;
  }

  static reconstitute(snapshot: CapabilitySnapshot): Capability {
    return new Capability(
      snapshot.id,
      snapshot.organizationId,
      snapshot.capacityProfileId,
      CapabilityName.create(snapshot.name),
      ProficiencyLevel.create(snapshot.proficiency),
      snapshot.certification,
      new Date(snapshot.effectiveFrom),
      snapshot.effectiveTo ? new Date(snapshot.effectiveTo) : null,
      snapshot.active,
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
  get name(): CapabilityName {
    return this._name;
  }
  get proficiency(): ProficiencyLevel {
    return this._proficiency;
  }
  get certification(): string | null {
    return this._certification;
  }
  get effectiveFrom(): Date {
    return new Date(this._effectiveFrom);
  }
  get effectiveTo(): Date | null {
    return this._effectiveTo ? new Date(this._effectiveTo) : null;
  }
  get active(): boolean {
    return this._active;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  remove(now: Date = new Date()): void {
    if (!this._active) {
      throw new CapacityProfileValidationError(
        "Capability is already removed.",
      );
    }
    this._active = false;
    this._effectiveTo = startOfUtcDay(now);
    this._updatedAt = now;
    this.record(
      CapabilityRemoved.create({
        organizationId: this._organizationId,
        capabilityId: this.id,
        capacityProfileId: this._capacityProfileId,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): CapabilitySnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      capacityProfileId: this._capacityProfileId,
      name: this._name.value,
      proficiency: this._proficiency.level,
      certification: this._certification,
      effectiveFrom: new Date(this._effectiveFrom),
      effectiveTo: this._effectiveTo ? new Date(this._effectiveTo) : null,
      active: this._active,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
