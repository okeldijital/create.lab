export const OrganizationStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ARCHIVED: "ARCHIVED",
  SUSPENDED: "SUSPENDED",
} as const;

export type OrganizationStatus =
  (typeof OrganizationStatus)[keyof typeof OrganizationStatus];

/** Allowed transitions for Organization status. ARCHIVED is terminal. */
export const ORGANIZATION_STATUS_TRANSITIONS: Readonly<
  Record<OrganizationStatus, readonly OrganizationStatus[]>
> = {
  [OrganizationStatus.ACTIVE]: [
    OrganizationStatus.INACTIVE,
    OrganizationStatus.SUSPENDED,
    OrganizationStatus.ARCHIVED,
  ],
  [OrganizationStatus.INACTIVE]: [
    OrganizationStatus.ACTIVE,
    OrganizationStatus.ARCHIVED,
  ],
  [OrganizationStatus.SUSPENDED]: [
    OrganizationStatus.ACTIVE,
    OrganizationStatus.ARCHIVED,
  ],
  [OrganizationStatus.ARCHIVED]: [],
};

export function canTransitionOrganizationStatus(
  from: OrganizationStatus,
  to: OrganizationStatus,
): boolean {
  if (from === to) return true;
  return ORGANIZATION_STATUS_TRANSITIONS[from].includes(to);
}
