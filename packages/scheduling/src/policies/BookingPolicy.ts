import type { Booking } from "../aggregates/Booking/Booking.js";
import type { Schedule } from "../aggregates/Schedule/Schedule.js";
import type { TimeBlock } from "../aggregates/TimeBlock/TimeBlock.js";
import { BookingStatus } from "../enums/BookingStatus.js";
import { TimeBlockType } from "../enums/TimeBlockType.js";
import {
  BookingConflictError,
  BookingLifecycleError,
} from "../errors/SchedulingErrors.js";
import { ScheduleLifecyclePolicy } from "./ScheduleLifecyclePolicy.js";
import { TimeBlockPolicy } from "./TimeBlockPolicy.js";

export class BookingPolicy {
  static assertCanCreate(
    schedule: Schedule,
    timeBlock: TimeBlock,
    existingOnBlock: readonly Booking[],
  ): void {
    ScheduleLifecyclePolicy.assertAcceptsBookings(schedule);
    if (timeBlock.scheduleId !== schedule.id) {
      throw new BookingConflictError(
        "Time block does not belong to the schedule.",
      );
    }
    TimeBlockPolicy.assertOpen(timeBlock);
    if (timeBlock.type !== TimeBlockType.BOOKABLE) {
      throw new BookingConflictError(
        `Time block type ${timeBlock.type} is not bookable.`,
      );
    }
    const active = existingOnBlock.filter(
      (b) =>
        b.status === BookingStatus.PLANNED ||
        b.status === BookingStatus.CONFIRMED,
    );
    if (active.length > 0) {
      throw new BookingConflictError(
        "Time block already has an active booking.",
      );
    }
  }

  static assertCanCancel(booking: Booking): void {
    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new BookingLifecycleError(
        `Cannot cancel booking in status ${booking.status}.`,
      );
    }
  }
}
