export const AssetVersionStatus = {
  CURRENT: "CURRENT",
  SUPERSEDED: "SUPERSEDED",
} as const;

export type AssetVersionStatus =
  (typeof AssetVersionStatus)[keyof typeof AssetVersionStatus];
