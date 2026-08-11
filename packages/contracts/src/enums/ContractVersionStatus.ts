export const ContractVersionStatus = {
  CURRENT: "CURRENT",
  SUPERSEDED: "SUPERSEDED",
} as const;

export type ContractVersionStatus =
  (typeof ContractVersionStatus)[keyof typeof ContractVersionStatus];
