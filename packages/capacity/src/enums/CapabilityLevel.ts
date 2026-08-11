export const CapabilityLevel = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
  EXPERT: "EXPERT",
} as const;

export type CapabilityLevel =
  (typeof CapabilityLevel)[keyof typeof CapabilityLevel];
