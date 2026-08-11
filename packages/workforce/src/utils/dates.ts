/** Normalize to UTC midnight for calendar-date comparisons. */
export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function isBeforeDay(a: Date, b: Date): boolean {
  return startOfUtcDay(a).getTime() < startOfUtcDay(b).getTime();
}

export function isAfterDay(a: Date, b: Date): boolean {
  return startOfUtcDay(a).getTime() > startOfUtcDay(b).getTime();
}

export function sameOrBeforeDay(a: Date, b: Date): boolean {
  return startOfUtcDay(a).getTime() <= startOfUtcDay(b).getTime();
}
