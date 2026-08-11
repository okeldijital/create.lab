export const PaymentMethod = {
  BANK_TRANSFER: "BANK_TRANSFER",
  CARD: "CARD",
  CASH: "CASH",
  EFT: "EFT",
  OTHER: "OTHER",
} as const;

export type PaymentMethod =
  (typeof PaymentMethod)[keyof typeof PaymentMethod];
