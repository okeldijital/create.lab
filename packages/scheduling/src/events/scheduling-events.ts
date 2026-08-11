import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { BookingStatus } from "../enums/BookingStatus.js";
import type { ScheduleStatus } from "../enums/ScheduleStatus.js";
import type { TimeBlockType } from "../enums/TimeBlockType.js";
import type {
  BookingId,
  CalendarId,
  ScheduleId,
  ShiftId,
  TimeBlockId,
} from "../types/ids.js";

export class ScheduleCreated extends DomainEvent<
  "ScheduleCreated",
  Readonly<{
    scheduleId: string;
    name: string;
    calendarId: string;
    status: ScheduleStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    scheduleId: ScheduleId;
    name: string;
    calendarId: CalendarId;
    status: ScheduleStatus;
    occurredAt?: Date;
  }): ScheduleCreated {
    return new ScheduleCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ScheduleCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.scheduleId,
      organizationId: input.organizationId,
      payload: {
        scheduleId: input.scheduleId,
        name: input.name,
        calendarId: input.calendarId,
        status: input.status,
      },
    });
  }
}

export class ScheduleArchived extends DomainEvent<
  "ScheduleArchived",
  Readonly<{ scheduleId: string }>
> {
  static create(input: {
    organizationId: string;
    scheduleId: ScheduleId;
    occurredAt?: Date;
  }): ScheduleArchived {
    return new ScheduleArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "ScheduleArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.scheduleId,
      organizationId: input.organizationId,
      payload: { scheduleId: input.scheduleId },
    });
  }
}

export class CalendarCreated extends DomainEvent<
  "CalendarCreated",
  Readonly<{ calendarId: string; name: string }>
> {
  static create(input: {
    organizationId: string;
    calendarId: CalendarId;
    name: string;
    occurredAt?: Date;
  }): CalendarCreated {
    return new CalendarCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "CalendarCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.calendarId,
      organizationId: input.organizationId,
      payload: { calendarId: input.calendarId, name: input.name },
    });
  }
}

export class BookingCreated extends DomainEvent<
  "BookingCreated",
  Readonly<{
    bookingId: string;
    scheduleId: string;
    timeBlockId: string;
    title: string;
    status: BookingStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    bookingId: BookingId;
    scheduleId: ScheduleId;
    timeBlockId: TimeBlockId;
    title: string;
    status: BookingStatus;
    occurredAt?: Date;
  }): BookingCreated {
    return new BookingCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "BookingCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.bookingId,
      organizationId: input.organizationId,
      payload: {
        bookingId: input.bookingId,
        scheduleId: input.scheduleId,
        timeBlockId: input.timeBlockId,
        title: input.title,
        status: input.status,
      },
    });
  }
}

export class BookingCancelled extends DomainEvent<
  "BookingCancelled",
  Readonly<{ bookingId: string; scheduleId: string }>
> {
  static create(input: {
    organizationId: string;
    bookingId: BookingId;
    scheduleId: ScheduleId;
    occurredAt?: Date;
  }): BookingCancelled {
    return new BookingCancelled({
      eventId: DomainEvent.nextEventId(),
      eventType: "BookingCancelled",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.bookingId,
      organizationId: input.organizationId,
      payload: {
        bookingId: input.bookingId,
        scheduleId: input.scheduleId,
      },
    });
  }
}

export class BookingCompleted extends DomainEvent<
  "BookingCompleted",
  Readonly<{ bookingId: string; scheduleId: string }>
> {
  static create(input: {
    organizationId: string;
    bookingId: BookingId;
    scheduleId: ScheduleId;
    occurredAt?: Date;
  }): BookingCompleted {
    return new BookingCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "BookingCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.bookingId,
      organizationId: input.organizationId,
      payload: {
        bookingId: input.bookingId,
        scheduleId: input.scheduleId,
      },
    });
  }
}

export class TimeBlockCreated extends DomainEvent<
  "TimeBlockCreated",
  Readonly<{
    timeBlockId: string;
    scheduleId: string;
    start: string;
    end: string;
    type: TimeBlockType;
  }>
> {
  static create(input: {
    organizationId: string;
    timeBlockId: TimeBlockId;
    scheduleId: ScheduleId;
    start: Date;
    end: Date;
    type: TimeBlockType;
    occurredAt?: Date;
  }): TimeBlockCreated {
    return new TimeBlockCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "TimeBlockCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.timeBlockId,
      organizationId: input.organizationId,
      payload: {
        timeBlockId: input.timeBlockId,
        scheduleId: input.scheduleId,
        start: input.start.toISOString(),
        end: input.end.toISOString(),
        type: input.type,
      },
    });
  }
}

export class TimeBlockRemoved extends DomainEvent<
  "TimeBlockRemoved",
  Readonly<{ timeBlockId: string; scheduleId: string }>
> {
  static create(input: {
    organizationId: string;
    timeBlockId: TimeBlockId;
    scheduleId: ScheduleId;
    occurredAt?: Date;
  }): TimeBlockRemoved {
    return new TimeBlockRemoved({
      eventId: DomainEvent.nextEventId(),
      eventType: "TimeBlockRemoved",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.timeBlockId,
      organizationId: input.organizationId,
      payload: {
        timeBlockId: input.timeBlockId,
        scheduleId: input.scheduleId,
      },
    });
  }
}

export class ShiftCreated extends DomainEvent<
  "ShiftCreated",
  Readonly<{
    shiftId: string;
    name: string;
    startTime: string;
    endTime: string;
  }>
> {
  static create(input: {
    organizationId: string;
    shiftId: ShiftId;
    name: string;
    startTime: string;
    endTime: string;
    occurredAt?: Date;
  }): ShiftCreated {
    return new ShiftCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ShiftCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.shiftId,
      organizationId: input.organizationId,
      payload: {
        shiftId: input.shiftId,
        name: input.name,
        startTime: input.startTime,
        endTime: input.endTime,
      },
    });
  }
}

export class ShiftUpdated extends DomainEvent<
  "ShiftUpdated",
  Readonly<{
    shiftId: string;
    name: string;
    startTime: string;
    endTime: string;
  }>
> {
  static create(input: {
    organizationId: string;
    shiftId: ShiftId;
    name: string;
    startTime: string;
    endTime: string;
    occurredAt?: Date;
  }): ShiftUpdated {
    return new ShiftUpdated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ShiftUpdated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.shiftId,
      organizationId: input.organizationId,
      payload: {
        shiftId: input.shiftId,
        name: input.name,
        startTime: input.startTime,
        endTime: input.endTime,
      },
    });
  }
}
