export const InitiativePriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export type InitiativePriority =
  (typeof InitiativePriority)[keyof typeof InitiativePriority];
