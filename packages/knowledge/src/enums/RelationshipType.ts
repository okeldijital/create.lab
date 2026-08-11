export const RelationshipType = {
  SUPERSEDES: "SUPERSEDES",
  REFERENCES: "REFERENCES",
  DEPENDS_ON: "DEPENDS_ON",
  RELATED_TO: "RELATED_TO",
  IMPLEMENTS: "IMPLEMENTS",
} as const;

export type RelationshipType =
  (typeof RelationshipType)[keyof typeof RelationshipType];
