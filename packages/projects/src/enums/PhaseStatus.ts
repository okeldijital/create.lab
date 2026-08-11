export const PhaseStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
} as const;

export type PhaseStatus = (typeof PhaseStatus)[keyof typeof PhaseStatus];
