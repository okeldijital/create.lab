export const CalendarStatus = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type CalendarStatus =
  (typeof CalendarStatus)[keyof typeof CalendarStatus];
