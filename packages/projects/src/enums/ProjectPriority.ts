export const ProjectPriority = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export type ProjectPriority =
  (typeof ProjectPriority)[keyof typeof ProjectPriority];
