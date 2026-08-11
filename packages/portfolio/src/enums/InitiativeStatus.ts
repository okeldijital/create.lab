export const InitiativeStatus = {
  PLANNED: "PLANNED",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type InitiativeStatus =
  (typeof InitiativeStatus)[keyof typeof InitiativeStatus];

export const INITIATIVE_TRANSITIONS: Readonly<
  Record<InitiativeStatus, readonly InitiativeStatus[]>
> = {
  [InitiativeStatus.PLANNED]: [
    InitiativeStatus.ACTIVE,
    InitiativeStatus.CANCELLED,
  ],
  [InitiativeStatus.ACTIVE]: [
    InitiativeStatus.COMPLETED,
    InitiativeStatus.CANCELLED,
  ],
  [InitiativeStatus.COMPLETED]: [],
  [InitiativeStatus.CANCELLED]: [],
};

export function canTransitionInitiative(
  from: InitiativeStatus,
  to: InitiativeStatus,
): boolean {
  if (from === to) return true;
  return INITIATIVE_TRANSITIONS[from].includes(to);
}
