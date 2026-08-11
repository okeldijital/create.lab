declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type ScheduleId = Brand<string, "ScheduleId">;
export type CalendarId = Brand<string, "CalendarId">;
export type TimeBlockId = Brand<string, "TimeBlockId">;
export type BookingId = Brand<string, "BookingId">;
export type ShiftId = Brand<string, "ShiftId">;

export function asScheduleId(value: string): ScheduleId {
  return value as ScheduleId;
}
export function asCalendarId(value: string): CalendarId {
  return value as CalendarId;
}
export function asTimeBlockId(value: string): TimeBlockId {
  return value as TimeBlockId;
}
export function asBookingId(value: string): BookingId {
  return value as BookingId;
}
export function asShiftId(value: string): ShiftId {
  return value as ShiftId;
}
