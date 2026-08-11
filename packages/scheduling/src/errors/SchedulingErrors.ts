import { DomainError } from "@creative-lab/core";

export class ScheduleNotFoundError extends DomainError {
  readonly code = "SCHEDULE_NOT_FOUND";
  constructor(identifier: string) {
    super(`Schedule not found: ${identifier}`);
  }
}

export class CalendarNotFoundError extends DomainError {
  readonly code = "CALENDAR_NOT_FOUND";
  constructor(identifier: string) {
    super(`Calendar not found: ${identifier}`);
  }
}

export class BookingConflictError extends DomainError {
  readonly code = "BOOKING_CONFLICT";
  constructor(message: string) {
    super(message);
  }
}

export class TimeBlockOverlapError extends DomainError {
  readonly code = "TIME_BLOCK_OVERLAP";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidTimeRangeError extends DomainError {
  readonly code = "INVALID_TIME_RANGE";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidShiftError extends DomainError {
  readonly code = "INVALID_SHIFT";
  constructor(message: string) {
    super(message);
  }
}

export class ArchivedScheduleError extends DomainError {
  readonly code = "ARCHIVED_SCHEDULE";
  constructor(scheduleId: string) {
    super(`Schedule "${scheduleId}" is archived and cannot accept bookings.`);
  }
}

export class BookingLifecycleError extends DomainError {
  readonly code = "BOOKING_LIFECYCLE";
  constructor(message: string) {
    super(message);
  }
}

export class ScheduleValidationError extends DomainError {
  readonly code = "SCHEDULE_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}

export class TimeBlockNotFoundError extends DomainError {
  readonly code = "TIME_BLOCK_NOT_FOUND";
  constructor(identifier: string) {
    super(`Time block not found: ${identifier}`);
  }
}

export class BookingNotFoundError extends DomainError {
  readonly code = "BOOKING_NOT_FOUND";
  constructor(identifier: string) {
    super(`Booking not found: ${identifier}`);
  }
}

export class ShiftNotFoundError extends DomainError {
  readonly code = "SHIFT_NOT_FOUND";
  constructor(identifier: string) {
    super(`Shift not found: ${identifier}`);
  }
}

export class DuplicateCalendarNameError extends DomainError {
  readonly code = "DUPLICATE_CALENDAR_NAME";
  constructor(name: string, organizationId: string) {
    super(
      `Calendar name "${name}" already exists in organization "${organizationId}".`,
    );
  }
}
