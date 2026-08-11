export const DecisionType = {
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  REQUEST_CHANGES: "REQUEST_CHANGES",
} as const;

export type DecisionType = (typeof DecisionType)[keyof typeof DecisionType];
