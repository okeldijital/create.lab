export const DependencyStatus = {
  ACTIVE: "ACTIVE",
  RESOLVED: "RESOLVED",
  CANCELLED: "CANCELLED",
} as const;

export type DependencyStatus =
  (typeof DependencyStatus)[keyof typeof DependencyStatus];
