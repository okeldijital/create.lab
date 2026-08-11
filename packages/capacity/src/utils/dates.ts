export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function isBeforeDay(a: Date, b: Date): boolean {
  return startOfUtcDay(a).getTime() < startOfUtcDay(b).getTime();
}

export function periodsOverlap(
  aFrom: Date,
  aTo: Date | null,
  bFrom: Date,
  bTo: Date | null,
): boolean {
  const aStart = startOfUtcDay(aFrom).getTime();
  const aEnd = aTo ? startOfUtcDay(aTo).getTime() : Number.POSITIVE_INFINITY;
  const bStart = startOfUtcDay(bFrom).getTime();
  const bEnd = bTo ? startOfUtcDay(bTo).getTime() : Number.POSITIVE_INFINITY;
  return aStart <= bEnd && bStart <= aEnd;
}
