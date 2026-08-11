export const VersionStatus = {
  DRAFT: "DRAFT",
  APPROVED: "APPROVED",
  CURRENT: "CURRENT",
  SUPERSEDED: "SUPERSEDED",
} as const;

export type VersionStatus =
  (typeof VersionStatus)[keyof typeof VersionStatus];

export const VERSION_TRANSITIONS: Readonly<
  Record<VersionStatus, readonly VersionStatus[]>
> = {
  [VersionStatus.DRAFT]: [VersionStatus.APPROVED, VersionStatus.SUPERSEDED],
  [VersionStatus.APPROVED]: [
    VersionStatus.CURRENT,
    VersionStatus.SUPERSEDED,
  ],
  [VersionStatus.CURRENT]: [VersionStatus.SUPERSEDED],
  [VersionStatus.SUPERSEDED]: [],
};

export function canTransitionVersion(
  from: VersionStatus,
  to: VersionStatus,
): boolean {
  if (from === to) return true;
  return VERSION_TRANSITIONS[from].includes(to);
}
