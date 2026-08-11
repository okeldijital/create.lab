export const PriceRuleStatus = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type PriceRuleStatus =
  (typeof PriceRuleStatus)[keyof typeof PriceRuleStatus];
