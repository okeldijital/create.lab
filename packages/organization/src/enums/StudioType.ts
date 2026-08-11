export const StudioType = {
  PHYSICAL: "PHYSICAL",
  VIRTUAL: "VIRTUAL",
  HYBRID: "HYBRID",
} as const;

export type StudioType = (typeof StudioType)[keyof typeof StudioType];
