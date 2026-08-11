export const AllocationStatus = {
  PLANNED: "PLANNED",
  ACTIVE: "ACTIVE",
  ON_HOLD: "ON_HOLD",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  ARCHIVED: "ARCHIVED",
} as const;

export type AllocationStatus =
  (typeof AllocationStatus)[keyof typeof AllocationStatus];

export const ALLOCATION_TRANSITIONS: Readonly<
  Record<AllocationStatus, readonly AllocationStatus[]>
> = {
  [AllocationStatus.PLANNED]: [
    AllocationStatus.ACTIVE,
    AllocationStatus.CANCELLED,
    AllocationStatus.ARCHIVED,
  ],
  [AllocationStatus.ACTIVE]: [
    AllocationStatus.ON_HOLD,
    AllocationStatus.COMPLETED,
    AllocationStatus.CANCELLED,
    AllocationStatus.ARCHIVED,
  ],
  [AllocationStatus.ON_HOLD]: [
    AllocationStatus.ACTIVE,
    AllocationStatus.CANCELLED,
    AllocationStatus.ARCHIVED,
  ],
  [AllocationStatus.COMPLETED]: [AllocationStatus.ARCHIVED],
  [AllocationStatus.CANCELLED]: [AllocationStatus.ARCHIVED],
  [AllocationStatus.ARCHIVED]: [],
};

export function canTransitionAllocation(
  from: AllocationStatus,
  to: AllocationStatus,
): boolean {
  if (from === to) return true;
  return ALLOCATION_TRANSITIONS[from].includes(to);
}

export function isActiveAllocationStatus(status: AllocationStatus): boolean {
  return (
    status === AllocationStatus.PLANNED ||
    status === AllocationStatus.ACTIVE ||
    status === AllocationStatus.ON_HOLD
  );
}
