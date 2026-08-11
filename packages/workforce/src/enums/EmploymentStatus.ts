export const EmploymentStatus = {
  ACTIVE: "ACTIVE",
  PROBATION: "PROBATION",
  SUSPENDED: "SUSPENDED",
  TERMINATED: "TERMINATED",
  ENDED: "ENDED",
} as const;

export type EmploymentStatus =
  (typeof EmploymentStatus)[keyof typeof EmploymentStatus];

export const ACTIVE_EMPLOYMENT_STATUSES: readonly EmploymentStatus[] = [
  EmploymentStatus.ACTIVE,
  EmploymentStatus.PROBATION,
  EmploymentStatus.SUSPENDED,
];

export function isActiveEmploymentStatus(status: EmploymentStatus): boolean {
  return ACTIVE_EMPLOYMENT_STATUSES.includes(status);
}
