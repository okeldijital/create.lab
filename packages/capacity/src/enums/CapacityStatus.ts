export const CapacityStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type CapacityStatus =
  (typeof CapacityStatus)[keyof typeof CapacityStatus];
