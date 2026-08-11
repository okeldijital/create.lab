export const ResourceType = {
  WORKER: "WORKER",
  STUDIO: "STUDIO",
} as const;

export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];
