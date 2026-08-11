export const ReferenceStatus = {
  ACTIVE: "ACTIVE",
  REMOVED: "REMOVED",
} as const;

export type ReferenceStatus =
  (typeof ReferenceStatus)[keyof typeof ReferenceStatus];
