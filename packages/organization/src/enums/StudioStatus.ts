export const StudioStatus = {
  AVAILABLE: "AVAILABLE",
  UNAVAILABLE: "UNAVAILABLE",
  MAINTENANCE: "MAINTENANCE",
  ARCHIVED: "ARCHIVED",
} as const;

export type StudioStatus = (typeof StudioStatus)[keyof typeof StudioStatus];
