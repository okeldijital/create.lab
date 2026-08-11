export const EngagementStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  ARCHIVED: "ARCHIVED",
} as const;

export type EngagementStatus =
  (typeof EngagementStatus)[keyof typeof EngagementStatus];

export const ENGAGEMENT_TRANSITIONS: Readonly<
  Record<EngagementStatus, readonly EngagementStatus[]>
> = {
  [EngagementStatus.DRAFT]: [
    EngagementStatus.ACTIVE,
    EngagementStatus.CANCELLED,
    EngagementStatus.ARCHIVED,
  ],
  [EngagementStatus.ACTIVE]: [
    EngagementStatus.SUSPENDED,
    EngagementStatus.COMPLETED,
    EngagementStatus.CANCELLED,
    EngagementStatus.ARCHIVED,
  ],
  [EngagementStatus.SUSPENDED]: [
    EngagementStatus.ACTIVE,
    EngagementStatus.CANCELLED,
    EngagementStatus.ARCHIVED,
  ],
  [EngagementStatus.COMPLETED]: [EngagementStatus.ARCHIVED],
  [EngagementStatus.CANCELLED]: [EngagementStatus.ARCHIVED],
  [EngagementStatus.ARCHIVED]: [],
};

export function canTransitionEngagement(
  from: EngagementStatus,
  to: EngagementStatus,
): boolean {
  if (from === to) return true;
  return ENGAGEMENT_TRANSITIONS[from].includes(to);
}
