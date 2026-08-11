export const ServiceStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type ServiceStatus =
  (typeof ServiceStatus)[keyof typeof ServiceStatus];

export const SERVICE_TRANSITIONS: Readonly<
  Record<ServiceStatus, readonly ServiceStatus[]>
> = {
  [ServiceStatus.DRAFT]: [ServiceStatus.ACTIVE, ServiceStatus.ARCHIVED],
  [ServiceStatus.ACTIVE]: [
    ServiceStatus.INACTIVE,
    ServiceStatus.ARCHIVED,
  ],
  [ServiceStatus.INACTIVE]: [
    ServiceStatus.ACTIVE,
    ServiceStatus.ARCHIVED,
  ],
  [ServiceStatus.ARCHIVED]: [],
};

export function canTransitionService(
  from: ServiceStatus,
  to: ServiceStatus,
): boolean {
  if (from === to) return true;
  return SERVICE_TRANSITIONS[from].includes(to);
}
