export const AllocationPriority = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export type AllocationPriority =
  (typeof AllocationPriority)[keyof typeof AllocationPriority];
