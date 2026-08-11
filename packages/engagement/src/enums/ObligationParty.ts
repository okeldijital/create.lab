export const ObligationParty = {
  ORGANIZATION: "ORGANIZATION",
  CUSTOMER: "CUSTOMER",
  BOTH: "BOTH",
} as const;

export type ObligationParty =
  (typeof ObligationParty)[keyof typeof ObligationParty];
