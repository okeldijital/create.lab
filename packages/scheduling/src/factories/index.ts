import { Schedule } from "../aggregates/Schedule/Schedule.js";
import type { CreateScheduleProps } from "../aggregates/Schedule/Schedule.js";
import { Calendar } from "../aggregates/Calendar/Calendar.js";
import type { CreateCalendarProps } from "../aggregates/Calendar/Calendar.js";
import { TimeBlock } from "../aggregates/TimeBlock/TimeBlock.js";
import type { CreateTimeBlockProps } from "../aggregates/TimeBlock/TimeBlock.js";
import { Booking } from "../aggregates/Booking/Booking.js";
import type { CreateBookingProps } from "../aggregates/Booking/Booking.js";
import { Shift } from "../aggregates/Shift/Shift.js";
import type { CreateShiftProps } from "../aggregates/Shift/Shift.js";

export const ScheduleFactory = {
  create: (props: CreateScheduleProps) => Schedule.create(props),
  reconstitute: Schedule.reconstitute.bind(Schedule),
};
export const CalendarFactory = {
  create: (props: CreateCalendarProps) => Calendar.create(props),
  reconstitute: Calendar.reconstitute.bind(Calendar),
};
export const TimeBlockFactory = {
  create: (props: CreateTimeBlockProps) => TimeBlock.create(props),
  reconstitute: TimeBlock.reconstitute.bind(TimeBlock),
};
export const BookingFactory = {
  create: (props: CreateBookingProps) => Booking.create(props),
  reconstitute: Booking.reconstitute.bind(Booking),
};
export const ShiftFactory = {
  create: (props: CreateShiftProps) => Shift.create(props),
  reconstitute: Shift.reconstitute.bind(Shift),
};
