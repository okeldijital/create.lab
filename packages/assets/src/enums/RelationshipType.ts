export const RelationshipType = {
  DERIVED_FROM: "DERIVED_FROM",
  CONTAINS: "CONTAINS",
  REFERENCES: "REFERENCES",
  GENERATED_FROM: "GENERATED_FROM",
  RELATED_TO: "RELATED_TO",
} as const;

export type RelationshipType =
  (typeof RelationshipType)[keyof typeof RelationshipType];
