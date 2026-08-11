import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { BookingStatus } from "../../enums/BookingStatus.js";
import { BookingLifecycleError } from "../../errors/SchedulingErrors.js";
import {
  BookingCancelled,
  BookingCompleted,
  BookingCreated,
} from "../../events/scheduling-events.js";
import {
  asBookingId,
  type BookingId,
  type ScheduleId,
  type TimeBlockId,
} from "../../types/ids.js";
import { BookingReference } from "../../value-objects/BookingReference.js";
import { BookingTitle } from "../../value-objects/BookingTitle.js";

export type CreateBookingProps = {
  organizationId: OrganizationId;
  scheduleId: ScheduleId;
  timeBlockId: TimeBlockId;
  title: string;
  bookingType?: string | null;
  resourceReference?: string | null;
  notes?: string | null;
  id?: string;
  now?: Date;
};

export type BookingSnapshot = {
  id: BookingId;
  organizationId: OrganizationId;
  scheduleId: ScheduleId;
  timeBlockId: TimeBlockId;
  title: string;
  bookingType: string | null;
  resourceReference: string | null;
  status: BookingStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const BOOKING_TRANSITIONS: Record<
  BookingStatus,
  readonly BookingStatus[]
> = {
  [BookingStatus.PLANNED]: [
    BookingStatus.CONFIRMED,
    BookingStatus.CANCELLED,
    BookingStatus.COMPLETED,
  ],
  [BookingStatus.CONFIRMED]: [
    BookingStatus.CANCELLED,
    BookingStatus.COMPLETED,
  ],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.COMPLETED]: [],
};

export class Booking extends AggregateRoot<BookingId> {
  private constructor(
    id: BookingId,
    private readonly _organizationId: OrganizationId,
    private readonly _scheduleId: ScheduleId,
    private readonly _timeBlockId: TimeBlockId,
    private _title: BookingTitle,
    private _bookingType: string | null,
    private _resourceReference: BookingReference | null,
    private _status: BookingStatus,
    private _notes: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateBookingProps): Booking {
    const title = BookingTitle.create(props.title);
    const now = props.now ?? new Date();
    const id = asBookingId(props.id ?? generateId());
    const booking = new Booking(
      id,
      props.organizationId,
      props.scheduleId,
      props.timeBlockId,
      title,
      props.bookingType?.trim() || null,
      BookingReference.create(props.resourceReference),
      BookingStatus.PLANNED,
      props.notes?.trim() || null,
      now,
      now,
    );
    booking.record(
      BookingCreated.create({
        organizationId: props.organizationId,
        bookingId: id,
        scheduleId: props.scheduleId,
        timeBlockId: props.timeBlockId,
        title: title.value,
        status: BookingStatus.PLANNED,
        occurredAt: now,
      }),
    );
    return booking;
  }

  static reconstitute(snapshot: BookingSnapshot): Booking {
    return new Booking(
      snapshot.id,
      snapshot.organizationId,
      snapshot.scheduleId,
      snapshot.timeBlockId,
      BookingTitle.create(snapshot.title),
      snapshot.bookingType,
      BookingReference.create(snapshot.resourceReference),
      snapshot.status,
      snapshot.notes,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get scheduleId(): ScheduleId {
    return this._scheduleId;
  }
  get timeBlockId(): TimeBlockId {
    return this._timeBlockId;
  }
  get title(): BookingTitle {
    return this._title;
  }
  get bookingType(): string | null {
    return this._bookingType;
  }
  get resourceReference(): BookingReference | null {
    return this._resourceReference;
  }
  get status(): BookingStatus {
    return this._status;
  }
  get notes(): string | null {
    return this._notes;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  confirm(now: Date = new Date()): void {
    this.transitionTo(BookingStatus.CONFIRMED, now);
  }

  cancel(now: Date = new Date()): void {
    this.transitionTo(BookingStatus.CANCELLED, now);
    this.record(
      BookingCancelled.create({
        organizationId: this._organizationId,
        bookingId: this.id,
        scheduleId: this._scheduleId,
        occurredAt: now,
      }),
    );
  }

  complete(now: Date = new Date()): void {
    this.transitionTo(BookingStatus.COMPLETED, now);
    this.record(
      BookingCompleted.create({
        organizationId: this._organizationId,
        bookingId: this.id,
        scheduleId: this._scheduleId,
        occurredAt: now,
      }),
    );
  }

  private transitionTo(to: BookingStatus, now: Date): void {
    if (!BOOKING_TRANSITIONS[this._status].includes(to)) {
      throw new BookingLifecycleError(
        `Invalid booking transition: ${this._status} → ${to}`,
      );
    }
    this._status = to;
    this._updatedAt = now;
  }

  toSnapshot(): BookingSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      scheduleId: this._scheduleId,
      timeBlockId: this._timeBlockId,
      title: this._title.value,
      bookingType: this._bookingType,
      resourceReference: this._resourceReference?.value ?? null,
      status: this._status,
      notes: this._notes,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
