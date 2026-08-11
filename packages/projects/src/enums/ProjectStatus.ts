export const ProjectStatus = {
  CREATED: "CREATED",
  PLANNING: "PLANNING",
  ACTIVE: "ACTIVE",
  ON_HOLD: "ON_HOLD",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  CLOSED: "CLOSED",
} as const;

export type ProjectStatus =
  (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const PROJECT_TRANSITIONS: Readonly<
  Record<ProjectStatus, readonly ProjectStatus[]>
> = {
  [ProjectStatus.CREATED]: [
    ProjectStatus.PLANNING,
    ProjectStatus.ACTIVE,
    ProjectStatus.CANCELLED,
  ],
  [ProjectStatus.PLANNING]: [
    ProjectStatus.ACTIVE,
    ProjectStatus.ON_HOLD,
    ProjectStatus.CANCELLED,
  ],
  [ProjectStatus.ACTIVE]: [
    ProjectStatus.ON_HOLD,
    ProjectStatus.COMPLETED,
    ProjectStatus.CANCELLED,
  ],
  [ProjectStatus.ON_HOLD]: [
    ProjectStatus.ACTIVE,
    ProjectStatus.PLANNING,
    ProjectStatus.CANCELLED,
  ],
  [ProjectStatus.COMPLETED]: [ProjectStatus.CLOSED],
  [ProjectStatus.CANCELLED]: [ProjectStatus.CLOSED],
  [ProjectStatus.CLOSED]: [],
};

export function canTransitionProject(
  from: ProjectStatus,
  to: ProjectStatus,
): boolean {
  if (from === to) return true;
  return PROJECT_TRANSITIONS[from].includes(to);
}
