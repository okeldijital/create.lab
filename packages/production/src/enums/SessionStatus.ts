export const SessionStatus = {
  OPEN: "OPEN",
  PAUSED: "PAUSED",
  RESUMED: "RESUMED",
  COMPLETED: "COMPLETED",
} as const;

export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

export const SESSION_TRANSITIONS: Readonly<
  Record<SessionStatus, readonly SessionStatus[]>
> = {
  [SessionStatus.OPEN]: [SessionStatus.PAUSED, SessionStatus.COMPLETED],
  [SessionStatus.PAUSED]: [SessionStatus.RESUMED, SessionStatus.COMPLETED],
  [SessionStatus.RESUMED]: [SessionStatus.PAUSED, SessionStatus.COMPLETED],
  [SessionStatus.COMPLETED]: [],
};

export function canTransitionSession(
  from: SessionStatus,
  to: SessionStatus,
): boolean {
  if (from === to) return true;
  return SESSION_TRANSITIONS[from].includes(to);
}

export function isOpenSessionStatus(status: SessionStatus): boolean {
  return (
    status === SessionStatus.OPEN ||
    status === SessionStatus.PAUSED ||
    status === SessionStatus.RESUMED
  );
}
