export const AssetStatus = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type AssetStatus = (typeof AssetStatus)[keyof typeof AssetStatus];
