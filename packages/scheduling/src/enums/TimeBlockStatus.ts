export const TimeBlockStatus = {
  OPEN: "OPEN",
  COMPLETED: "COMPLETED",
  REMOVED: "REMOVED",
} as const;

export type TimeBlockStatus =
  (typeof TimeBlockStatus)[keyof typeof TimeBlockStatus];
