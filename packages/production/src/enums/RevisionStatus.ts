export const RevisionStatus = {
  REQUESTED: "REQUESTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CLOSED: "CLOSED",
} as const;

export type RevisionStatus =
  (typeof RevisionStatus)[keyof typeof RevisionStatus];

export const REVISION_TRANSITIONS: Readonly<
  Record<RevisionStatus, readonly RevisionStatus[]>
> = {
  [RevisionStatus.REQUESTED]: [
    RevisionStatus.IN_PROGRESS,
    RevisionStatus.CLOSED,
  ],
  [RevisionStatus.IN_PROGRESS]: [
    RevisionStatus.COMPLETED,
    RevisionStatus.CLOSED,
  ],
  [RevisionStatus.COMPLETED]: [RevisionStatus.CLOSED],
  [RevisionStatus.CLOSED]: [],
};

export function canTransitionRevision(
  from: RevisionStatus,
  to: RevisionStatus,
): boolean {
  if (from === to) return true;
  return REVISION_TRANSITIONS[from].includes(to);
}
