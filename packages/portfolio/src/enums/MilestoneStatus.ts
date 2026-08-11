export const MilestoneStatus = {
  PLANNED: "PLANNED",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
} as const;

export type MilestoneStatus =
  (typeof MilestoneStatus)[keyof typeof MilestoneStatus];

export const MILESTONE_TRANSITIONS: Readonly<
  Record<MilestoneStatus, readonly MilestoneStatus[]>
> = {
  [MilestoneStatus.PLANNED]: [MilestoneStatus.ACTIVE],
  [MilestoneStatus.ACTIVE]: [MilestoneStatus.COMPLETED],
  [MilestoneStatus.COMPLETED]: [],
};

export function canTransitionMilestone(
  from: MilestoneStatus,
  to: MilestoneStatus,
): boolean {
  if (from === to) return true;
  return MILESTONE_TRANSITIONS[from].includes(to);
}
