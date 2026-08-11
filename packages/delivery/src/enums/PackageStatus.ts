export const PackageStatus = {
  OPEN: "OPEN",
  SEALED: "SEALED",
  ARCHIVED: "ARCHIVED",
} as const;

export type PackageStatus =
  (typeof PackageStatus)[keyof typeof PackageStatus];
