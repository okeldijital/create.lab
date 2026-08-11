export const ContractStatus = {
  DRAFT: "DRAFT",
  PENDING_SIGNATURE: "PENDING_SIGNATURE",
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  TERMINATED: "TERMINATED",
  ARCHIVED: "ARCHIVED",
} as const;

export type ContractStatus =
  (typeof ContractStatus)[keyof typeof ContractStatus];

export const CONTRACT_TRANSITIONS: Readonly<
  Record<ContractStatus, readonly ContractStatus[]>
> = {
  [ContractStatus.DRAFT]: [
    ContractStatus.PENDING_SIGNATURE,
    ContractStatus.ARCHIVED,
  ],
  [ContractStatus.PENDING_SIGNATURE]: [
    ContractStatus.ACTIVE,
    ContractStatus.DRAFT,
    ContractStatus.ARCHIVED,
  ],
  [ContractStatus.ACTIVE]: [
    ContractStatus.EXPIRED,
    ContractStatus.TERMINATED,
    ContractStatus.ARCHIVED,
  ],
  [ContractStatus.EXPIRED]: [ContractStatus.ARCHIVED],
  [ContractStatus.TERMINATED]: [ContractStatus.ARCHIVED],
  [ContractStatus.ARCHIVED]: [],
};

export function canTransitionContract(
  from: ContractStatus,
  to: ContractStatus,
): boolean {
  if (from === to) return true;
  return CONTRACT_TRANSITIONS[from].includes(to);
}
