export const ContractStatus = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  TERMINATED: "TERMINATED",
} as const;

export type ContractStatus =
  (typeof ContractStatus)[keyof typeof ContractStatus];
