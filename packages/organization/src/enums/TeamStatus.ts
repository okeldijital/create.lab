export const TeamStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type TeamStatus = (typeof TeamStatus)[keyof typeof TeamStatus];
