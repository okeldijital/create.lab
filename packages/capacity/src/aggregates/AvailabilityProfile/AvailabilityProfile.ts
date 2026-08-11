import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { InvalidAvailabilityProfileError } from "../../errors/CapacityErrors.js";
import {
  AvailabilityProfileCreated,
  AvailabilityProfileUpdated,
} from "../../events/capacity-events.js";
import {
  asAvailabilityProfileId,
  type AvailabilityProfileId,
} from "../../types/ids.js";
import { Timezone } from "../../value-objects/Timezone.js";
import {
  WorkingDaySet,
  type Weekday,
} from "../../value-objects/WorkingDaySet.js";
import { WorkingHours } from "../../value-objects/WorkingHours.js";

/** Named exception rule without calendar dates (template only). */
export type AvailabilityException = Readonly<{
  name: string;
  description?: string;
}>;

export type CreateAvailabilityProfileProps = {
  organizationId: OrganizationId;
  name: string;
  timezone?: string;
  workingDays?: readonly Weekday[];
  workingHoursStart?: string;
  workingHoursEnd?: string;
  exceptions?: readonly AvailabilityException[];
  id?: string;
  now?: Date;
};

export type AvailabilityProfileSnapshot = {
  id: AvailabilityProfileId;
  organizationId: OrganizationId;
  name: string;
  timezone: string;
  workingDays: readonly Weekday[];
  workingHoursStart: string;
  workingHoursEnd: string;
  exceptions: readonly AvailabilityException[];
  createdAt: Date;
  updatedAt: Date;
};

export class AvailabilityProfile extends AggregateRoot<AvailabilityProfileId> {
  private constructor(
    id: AvailabilityProfileId,
    private readonly _organizationId: OrganizationId,
    private _name: string,
    private _timezone: Timezone,
    private _workingDays: WorkingDaySet,
    private _workingHours: WorkingHours,
    private _exceptions: readonly AvailabilityException[],
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateAvailabilityProfileProps): AvailabilityProfile {
    const name = props.name?.trim();
    if (!name) {
      throw new InvalidAvailabilityProfileError(
        "Availability profile name is required.",
      );
    }
    const now = props.now ?? new Date();
    const id = asAvailabilityProfileId(props.id ?? generateId());
    const profile = new AvailabilityProfile(
      id,
      props.organizationId,
      name,
      Timezone.create(props.timezone ?? "UTC"),
      props.workingDays
        ? WorkingDaySet.create(props.workingDays)
        : WorkingDaySet.mondayToFriday(),
      props.workingHoursStart && props.workingHoursEnd
        ? WorkingHours.create(props.workingHoursStart, props.workingHoursEnd)
        : WorkingHours.defaultNineToFive(),
      Object.freeze([...(props.exceptions ?? [])]),
      now,
      now,
    );

    profile.record(
      AvailabilityProfileCreated.create({
        organizationId: props.organizationId,
        availabilityProfileId: id,
        name,
        occurredAt: now,
      }),
    );

    return profile;
  }

  static reconstitute(
    snapshot: AvailabilityProfileSnapshot,
  ): AvailabilityProfile {
    return new AvailabilityProfile(
      snapshot.id,
      snapshot.organizationId,
      snapshot.name,
      Timezone.create(snapshot.timezone),
      WorkingDaySet.create(snapshot.workingDays),
      WorkingHours.create(
        snapshot.workingHoursStart,
        snapshot.workingHoursEnd,
      ),
      Object.freeze([...snapshot.exceptions]),
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get name(): string {
    return this._name;
  }
  get timezone(): Timezone {
    return this._timezone;
  }
  get workingDays(): WorkingDaySet {
    return this._workingDays;
  }
  get workingHours(): WorkingHours {
    return this._workingHours;
  }
  get exceptions(): readonly AvailabilityException[] {
    return this._exceptions;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  update(props: {
    name?: string;
    timezone?: string;
    workingDays?: readonly Weekday[];
    workingHoursStart?: string;
    workingHoursEnd?: string;
    exceptions?: readonly AvailabilityException[];
    now?: Date;
  }): void {
    const now = props.now ?? new Date();
    if (props.name !== undefined) {
      const name = props.name.trim();
      if (!name) {
        throw new InvalidAvailabilityProfileError(
          "Availability profile name is required.",
        );
      }
      this._name = name;
    }
    if (props.timezone !== undefined) {
      this._timezone = Timezone.create(props.timezone);
    }
    if (props.workingDays !== undefined) {
      this._workingDays = WorkingDaySet.create(props.workingDays);
    }
    if (
      props.workingHoursStart !== undefined ||
      props.workingHoursEnd !== undefined
    ) {
      this._workingHours = WorkingHours.create(
        props.workingHoursStart ?? this._workingHours.start,
        props.workingHoursEnd ?? this._workingHours.end,
      );
    }
    if (props.exceptions !== undefined) {
      this._exceptions = Object.freeze([...props.exceptions]);
    }
    this._updatedAt = now;
    this.record(
      AvailabilityProfileUpdated.create({
        organizationId: this._organizationId,
        availabilityProfileId: this.id,
        name: this._name,
        timezone: this._timezone.value,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): AvailabilityProfileSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      name: this._name,
      timezone: this._timezone.value,
      workingDays: [...this._workingDays.days],
      workingHoursStart: this._workingHours.start,
      workingHoursEnd: this._workingHours.end,
      exceptions: [...this._exceptions],
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
