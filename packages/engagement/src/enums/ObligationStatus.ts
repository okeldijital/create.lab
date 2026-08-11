export const ObligationStatus = {
  PENDING: "PENDING",
  FULFILLED: "FULFILLED",
  WAIVED: "WAIVED",
} as const;

export type ObligationStatus =
  (typeof ObligationStatus)[keyof typeof ObligationStatus];
