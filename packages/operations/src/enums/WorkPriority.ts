export const WorkPriority = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export type WorkPriority = (typeof WorkPriority)[keyof typeof WorkPriority];
