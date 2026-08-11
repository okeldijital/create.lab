import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { CalendarStatus } from "../../enums/CalendarStatus.js";
import { ScheduleValidationError } from "../../errors/SchedulingErrors.js";
import { CalendarCreated } from "../../events/scheduling-events.js";
import { asCalendarId, type CalendarId } from "../../types/ids.js";
import { CalendarName } from "../../value-objects/CalendarName.js";
import { Timezone } from "../../value-objects/Timezone.js";

export type CreateCalendarProps = {
  organizationId: OrganizationId;
  name: string;
  description?: string | null;
  timezone?: string;
  id?: string;
  now?: Date;
};

export type CalendarSnapshot = {
  id: CalendarId;
  organizationId: OrganizationId;
  name: string;
  description: string | null;
  timezone: string;
  status: CalendarStatus;
  createdAt: Date;
  updatedAt: Date;
};

export class Calendar extends AggregateRoot<CalendarId> {
  private constructor(
    id: CalendarId,
    private readonly _organizationId: OrganizationId,
    private _name: CalendarName,
    private _description: string | null,
    private readonly _timezone: Timezone,
    private _status: CalendarStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateCalendarProps): Calendar {
    const name = CalendarName.create(props.name);
    const timezone = Timezone.create(props.timezone ?? "UTC");
    const now = props.now ?? new Date();
    const id = asCalendarId(props.id ?? generateId());
    const calendar = new Calendar(
      id,
      props.organizationId,
      name,
      props.description?.trim() || null,
      timezone,
      CalendarStatus.ACTIVE,
      now,
      now,
    );
    calendar.record(
      CalendarCreated.create({
        organizationId: props.organizationId,
        calendarId: id,
        name: name.value,
        occurredAt: now,
      }),
    );
    return calendar;
  }

  static reconstitute(snapshot: CalendarSnapshot): Calendar {
    return new Calendar(
      snapshot.id,
      snapshot.organizationId,
      CalendarName.create(snapshot.name),
      snapshot.description,
      Timezone.create(snapshot.timezone),
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get name(): CalendarName {
    return this._name;
  }
  get description(): string | null {
    return this._description;
  }
  get timezone(): Timezone {
    return this._timezone;
  }
  get status(): CalendarStatus {
    return this._status;
  }
  get isArchived(): boolean {
    return this._status === CalendarStatus.ARCHIVED;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateDescription(description: string | null, now: Date = new Date()): void {
    if (this.isArchived) {
      throw new ScheduleValidationError("Archived calendar cannot be modified.");
    }
    this._description = description?.trim() || null;
    this._updatedAt = now;
  }

  archive(now: Date = new Date()): void {
    if (this.isArchived) {
      throw new ScheduleValidationError("Calendar is already archived.");
    }
    this._status = CalendarStatus.ARCHIVED;
    this._updatedAt = now;
  }

  toSnapshot(): CalendarSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      name: this._name.value,
      description: this._description,
      timezone: this._timezone.value,
      status: this._status,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
