export const DeliveryPriority = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export type DeliveryPriority =
  (typeof DeliveryPriority)[keyof typeof DeliveryPriority];
