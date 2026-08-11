export const PricingModel = {
  FIXED: "FIXED",
  HOURLY: "HOURLY",
  DAILY: "DAILY",
  PER_UNIT: "PER_UNIT",
  CUSTOM: "CUSTOM",
} as const;

export type PricingModel =
  (typeof PricingModel)[keyof typeof PricingModel];
