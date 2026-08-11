export const TimeBlockType = {
  BOOKABLE: "BOOKABLE",
  BLOCKED: "BLOCKED",
  MAINTENANCE: "MAINTENANCE",
  BREAK: "BREAK",
} as const;

export type TimeBlockType = (typeof TimeBlockType)[keyof typeof TimeBlockType];
