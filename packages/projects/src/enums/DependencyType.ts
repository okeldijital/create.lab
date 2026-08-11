export const DependencyType = {
  BLOCKS: "BLOCKS",
  RELATES_TO: "RELATES_TO",
  OPTIONAL: "OPTIONAL",
} as const;

export type DependencyType =
  (typeof DependencyType)[keyof typeof DependencyType];
