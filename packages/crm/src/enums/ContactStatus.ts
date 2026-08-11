export const ContactStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type ContactStatus =
  (typeof ContactStatus)[keyof typeof ContactStatus];
