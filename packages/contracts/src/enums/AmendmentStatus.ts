export const AmendmentStatus = {
  DRAFT: "DRAFT",
  APPROVED: "APPROVED",
  APPLIED: "APPLIED",
  ARCHIVED: "ARCHIVED",
} as const;

export type AmendmentStatus =
  (typeof AmendmentStatus)[keyof typeof AmendmentStatus];
