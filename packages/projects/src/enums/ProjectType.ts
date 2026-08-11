export const ProjectType = {
  CLIENT: "CLIENT",
  INTERNAL: "INTERNAL",
  RESEARCH: "RESEARCH",
  PRODUCT: "PRODUCT",
  MARKETING: "MARKETING",
  OTHER: "OTHER",
} as const;

export type ProjectType = (typeof ProjectType)[keyof typeof ProjectType];
