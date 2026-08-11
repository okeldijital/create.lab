/**
 * Resource classification for allocation commitments.
 * Opaque relative to Capacity — Allocation does not compute capability.
 */
export const ResourceType = {
  WORKER: "WORKER",
  TEAM: "TEAM",
  STUDIO: "STUDIO",
  EQUIPMENT: "EQUIPMENT",
} as const;

export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];
