export const PositionStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type PositionStatus =
  (typeof PositionStatus)[keyof typeof PositionStatus];
