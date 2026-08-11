export const ObjectiveStatus = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  ACHIEVED: "ACHIEVED",
  FAILED: "FAILED",
} as const;

export type ObjectiveStatus =
  (typeof ObjectiveStatus)[keyof typeof ObjectiveStatus];
