export const ReceiptStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  REJECTED: "REJECTED",
} as const;

export type ReceiptStatus =
  (typeof ReceiptStatus)[keyof typeof ReceiptStatus];
