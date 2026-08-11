export const ProgramStatus = {
  PLANNED: "PLANNED",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  ARCHIVED: "ARCHIVED",
} as const;

export type ProgramStatus =
  (typeof ProgramStatus)[keyof typeof ProgramStatus];

export const PROGRAM_TRANSITIONS: Readonly<
  Record<ProgramStatus, readonly ProgramStatus[]>
> = {
  [ProgramStatus.PLANNED]: [ProgramStatus.ACTIVE, ProgramStatus.ARCHIVED],
  [ProgramStatus.ACTIVE]: [
    ProgramStatus.COMPLETED,
    ProgramStatus.ARCHIVED,
  ],
  [ProgramStatus.COMPLETED]: [ProgramStatus.ARCHIVED],
  [ProgramStatus.ARCHIVED]: [],
};

export function canTransitionProgram(
  from: ProgramStatus,
  to: ProgramStatus,
): boolean {
  if (from === to) return true;
  return PROGRAM_TRANSITIONS[from].includes(to);
}
