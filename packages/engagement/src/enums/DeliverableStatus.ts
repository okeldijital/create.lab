export const DeliverableStatus = {
  PLANNED: "PLANNED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  ACCEPTED: "ACCEPTED",
} as const;

export type DeliverableStatus =
  (typeof DeliverableStatus)[keyof typeof DeliverableStatus];

export const DELIVERABLE_TRANSITIONS: Readonly<
  Record<DeliverableStatus, readonly DeliverableStatus[]>
> = {
  [DeliverableStatus.PLANNED]: [DeliverableStatus.IN_PROGRESS],
  [DeliverableStatus.IN_PROGRESS]: [DeliverableStatus.COMPLETED],
  [DeliverableStatus.COMPLETED]: [DeliverableStatus.ACCEPTED],
  [DeliverableStatus.ACCEPTED]: [],
};

export function canTransitionDeliverable(
  from: DeliverableStatus,
  to: DeliverableStatus,
): boolean {
  if (from === to) return true;
  return DELIVERABLE_TRANSITIONS[from].includes(to);
}
