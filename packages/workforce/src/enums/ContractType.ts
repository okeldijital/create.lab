export const ContractType = {
  PERMANENT: "PERMANENT",
  FIXED_TERM: "FIXED_TERM",
  ZERO_HOURS: "ZERO_HOURS",
  CONSULTING: "CONSULTING",
  OTHER: "OTHER",
} as const;

export type ContractType = (typeof ContractType)[keyof typeof ContractType];
