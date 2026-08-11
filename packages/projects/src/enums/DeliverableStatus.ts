export const DeliverableStatus = {
  PLANNED: "PLANNED",
  IN_PROGRESS: "IN_PROGRESS",
  READY_FOR_REVIEW: "READY_FOR_REVIEW",
  APPROVED: "APPROVED",
  DELIVERED: "DELIVERED",
} as const;

export type DeliverableStatus =
  (typeof DeliverableStatus)[keyof typeof DeliverableStatus];

export const DELIVERABLE_TRANSITIONS: Readonly<
  Record<DeliverableStatus, readonly DeliverableStatus[]>
> = {
  [DeliverableStatus.PLANNED]: [
    DeliverableStatus.IN_PROGRESS,
  ],
  [DeliverableStatus.IN_PROGRESS]: [
    DeliverableStatus.READY_FOR_REVIEW,
    DeliverableStatus.PLANNED,
  ],
  [DeliverableStatus.READY_FOR_REVIEW]: [
    DeliverableStatus.APPROVED,
    DeliverableStatus.IN_PROGRESS,
  ],
  [DeliverableStatus.APPROVED]: [DeliverableStatus.DELIVERED],
  [DeliverableStatus.DELIVERED]: [],
};

export function canTransitionDeliverable(
  from: DeliverableStatus,
  to: DeliverableStatus,
): boolean {
  if (from === to) return true;
  return DELIVERABLE_TRANSITIONS[from].includes(to);
}
