import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { ScheduleStatus } from "../../enums/ScheduleStatus.js";
import {
  ArchivedScheduleError,
  ScheduleValidationError,
} from "../../errors/SchedulingErrors.js";
import {
  ScheduleArchived,
  ScheduleCreated,
} from "../../events/scheduling-events.js";
import {
  asScheduleId,
  type CalendarId,
  type ScheduleId,
} from "../../types/ids.js";
import { ScheduleName } from "../../value-objects/ScheduleName.js";
import { Timezone } from "../../value-objects/Timezone.js";

export type CreateScheduleProps = {
  organizationId: OrganizationId;
  name: string;
  calendarId: CalendarId;
  timezone?: string;
  purpose?: string | null;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
  id?: string;
  now?: Date;
};

export type ScheduleSnapshot = {
  id: ScheduleId;
  organizationId: OrganizationId;
  name: string;
  timezone: string;
  status: ScheduleStatus;
  calendarId: CalendarId;
  purpose: string | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class Schedule extends AggregateRoot<ScheduleId> {
  private constructor(
    id: ScheduleId,
    private readonly _organizationId: OrganizationId,
    private _name: ScheduleName,
    private readonly _timezone: Timezone,
    private _status: ScheduleStatus,
    private readonly _calendarId: CalendarId,
    private readonly _purpose: string | null,
    private _effectiveFrom: Date,
    private _effectiveTo: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateScheduleProps): Schedule {
    const name = ScheduleName.create(props.name);
    const timezone = Timezone.create(props.timezone ?? "UTC");
    const effectiveFrom = props.effectiveFrom ?? props.now ?? new Date();
    const effectiveTo = props.effectiveTo ?? null;
    if (
      effectiveTo &&
      effectiveTo.getTime() < effectiveFrom.getTime()
    ) {
      throw new ScheduleValidationError(
        "Schedule effective end cannot precede start.",
      );
    }
    const now = props.now ?? new Date();
    const id = asScheduleId(props.id ?? generateId());
    const schedule = new Schedule(
      id,
      props.organizationId,
      name,
      timezone,
      ScheduleStatus.ACTIVE,
      props.calendarId,
      props.purpose?.trim() || null,
      new Date(effectiveFrom),
      effectiveTo ? new Date(effectiveTo) : null,
      now,
      now,
    );
    schedule.record(
      ScheduleCreated.create({
        organizationId: props.organizationId,
        scheduleId: id,
        name: name.value,
        calendarId: props.calendarId,
        status: ScheduleStatus.ACTIVE,
        occurredAt: now,
      }),
    );
    return schedule;
  }

  static reconstitute(snapshot: ScheduleSnapshot): Schedule {
    return new Schedule(
      snapshot.id,
      snapshot.organizationId,
      ScheduleName.create(snapshot.name),
      Timezone.create(snapshot.timezone),
      snapshot.status,
      snapshot.calendarId,
      snapshot.purpose,
      new Date(snapshot.effectiveFrom),
      snapshot.effectiveTo ? new Date(snapshot.effectiveTo) : null,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get name(): ScheduleName {
    return this._name;
  }
  get timezone(): Timezone {
    return this._timezone;
  }
  get status(): ScheduleStatus {
    return this._status;
  }
  get calendarId(): CalendarId {
    return this._calendarId;
  }
  get purpose(): string | null {
    return this._purpose;
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
  get isArchived(): boolean {
    return this._status === ScheduleStatus.ARCHIVED;
  }
  get isActive(): boolean {
    return this._status === ScheduleStatus.ACTIVE;
  }

  rename(name: string, now: Date = new Date()): void {
    this.assertNotArchived();
    this._name = ScheduleName.create(name);
    this._updatedAt = now;
  }

  archive(now: Date = new Date()): void {
    if (this.isArchived) {
      throw new ScheduleValidationError("Schedule is already archived.");
    }
    this._status = ScheduleStatus.ARCHIVED;
    this._updatedAt = now;
    this.record(
      ScheduleArchived.create({
        organizationId: this._organizationId,
        scheduleId: this.id,
        occurredAt: now,
      }),
    );
  }

  assertAcceptsBookings(): void {
    if (this.isArchived) {
      throw new ArchivedScheduleError(this.id);
    }
    if (this._status === ScheduleStatus.INACTIVE) {
      throw new ScheduleValidationError(
        "Inactive schedules cannot receive bookings.",
      );
    }
  }

  private assertNotArchived(): void {
    if (this.isArchived) {
      throw new ArchivedScheduleError(this.id);
    }
  }

  toSnapshot(): ScheduleSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      name: this._name.value,
      timezone: this._timezone.value,
      status: this._status,
      calendarId: this._calendarId,
      purpose: this._purpose,
      effectiveFrom: new Date(this._effectiveFrom),
      effectiveTo: this._effectiveTo ? new Date(this._effectiveTo) : null,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
