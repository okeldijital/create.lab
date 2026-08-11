export const ProductionPriority = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export type ProductionPriority =
  (typeof ProductionPriority)[keyof typeof ProductionPriority];
