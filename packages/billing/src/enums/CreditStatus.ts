export const CreditStatus = {
  DRAFT: "DRAFT",
  ISSUED: "ISSUED",
  APPLIED: "APPLIED",
  ARCHIVED: "ARCHIVED",
} as const;

export type CreditStatus = (typeof CreditStatus)[keyof typeof CreditStatus];
