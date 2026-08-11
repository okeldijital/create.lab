export const OutputType = {
  AUDIO: "AUDIO",
  VIDEO: "VIDEO",
  IMAGE: "IMAGE",
  DOCUMENT: "DOCUMENT",
  OTHER: "OTHER",
} as const;

export type OutputType = (typeof OutputType)[keyof typeof OutputType];
