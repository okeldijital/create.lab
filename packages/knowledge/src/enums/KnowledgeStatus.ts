export const KnowledgeStatus = {
  DRAFT: "DRAFT",
  REVIEW: "REVIEW",
  APPROVED: "APPROVED",
  ACTIVE: "ACTIVE",
  RETIRED: "RETIRED",
  ARCHIVED: "ARCHIVED",
} as const;

export type KnowledgeStatus =
  (typeof KnowledgeStatus)[keyof typeof KnowledgeStatus];

export const KNOWLEDGE_TRANSITIONS: Readonly<
  Record<KnowledgeStatus, readonly KnowledgeStatus[]>
> = {
  [KnowledgeStatus.DRAFT]: [
    KnowledgeStatus.REVIEW,
    KnowledgeStatus.ARCHIVED,
  ],
  [KnowledgeStatus.REVIEW]: [
    KnowledgeStatus.APPROVED,
    KnowledgeStatus.DRAFT,
    KnowledgeStatus.ARCHIVED,
  ],
  [KnowledgeStatus.APPROVED]: [
    KnowledgeStatus.ACTIVE,
    KnowledgeStatus.DRAFT,
    KnowledgeStatus.ARCHIVED,
  ],
  [KnowledgeStatus.ACTIVE]: [
    KnowledgeStatus.RETIRED,
    KnowledgeStatus.ARCHIVED,
  ],
  [KnowledgeStatus.RETIRED]: [KnowledgeStatus.ARCHIVED],
  [KnowledgeStatus.ARCHIVED]: [],
};

export function canTransitionKnowledge(
  from: KnowledgeStatus,
  to: KnowledgeStatus,
): boolean {
  if (from === to) return true;
  return KNOWLEDGE_TRANSITIONS[from].includes(to);
}
