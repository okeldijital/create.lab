export const OutputStatus = {
  DRAFT: "DRAFT",
  REVIEW: "REVIEW",
  APPROVED: "APPROVED",
  DELIVERED: "DELIVERED",
  ARCHIVED: "ARCHIVED",
} as const;

export type OutputStatus = (typeof OutputStatus)[keyof typeof OutputStatus];
