export const SessionStatus = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

export const SESSION_TRANSITIONS: Readonly<
  Record<SessionStatus, readonly SessionStatus[]>
> = {
  [SessionStatus.OPEN]: [
    SessionStatus.IN_PROGRESS,
    SessionStatus.COMPLETED,
  ],
  [SessionStatus.IN_PROGRESS]: [SessionStatus.COMPLETED],
  [SessionStatus.COMPLETED]: [],
};

export function canTransitionSession(
  from: SessionStatus,
  to: SessionStatus,
): boolean {
  if (from === to) return true;
  return SESSION_TRANSITIONS[from].includes(to);
}

export function isActiveSessionStatus(status: SessionStatus): boolean {
  return (
    status === SessionStatus.OPEN || status === SessionStatus.IN_PROGRESS
  );
}
