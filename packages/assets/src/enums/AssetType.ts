export const AssetType = {
  AUDIO: "AUDIO",
  MIX: "MIX",
  MASTER: "MASTER",
  STEM: "STEM",
  SESSION: "SESSION",
  PROJECT: "PROJECT",
  ARTWORK: "ARTWORK",
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  DOCUMENT: "DOCUMENT",
  ARCHIVE: "ARCHIVE",
  OTHER: "OTHER",
} as const;

export type AssetType = (typeof AssetType)[keyof typeof AssetType];
