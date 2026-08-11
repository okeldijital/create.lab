export function durationMs(start: Date, end: Date): number {
  return end.getTime() - start.getTime();
}
