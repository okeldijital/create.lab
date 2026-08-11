export const CapacityUnit = {
  HOURS: "HOURS",
  SESSIONS: "SESSIONS",
  TASKS: "TASKS",
  UNITS: "UNITS",
} as const;

export type CapacityUnit = (typeof CapacityUnit)[keyof typeof CapacityUnit];
