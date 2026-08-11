export const ShiftType = {
  MORNING: "MORNING",
  AFTERNOON: "AFTERNOON",
  NIGHT: "NIGHT",
  CUSTOM: "CUSTOM",
} as const;

export type ShiftType = (typeof ShiftType)[keyof typeof ShiftType];
