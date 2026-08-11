export const InteractionType = {
  CALL: "CALL",
  EMAIL: "EMAIL",
  MEETING: "MEETING",
  NOTE: "NOTE",
  OTHER: "OTHER",
} as const;

export type InteractionType =
  (typeof InteractionType)[keyof typeof InteractionType];
