/** Parse HH:mm to minutes since midnight (0–1439). */
export function parseWorkingTimeToMinutes(time: string): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) {
    throw new Error(`Invalid working time (expected HH:mm): ${time}`);
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Duration in minutes for a wall-clock window; overnight when end < start. */
export function durationMinutes(start: string, end: string): number {
  const s = parseWorkingTimeToMinutes(start);
  const e = parseWorkingTimeToMinutes(end);
  if (e > s) return e - s;
  if (e < s) return 24 * 60 - s + e; // overnight
  return 0; // zero duration — invalid for shifts
}

export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}
