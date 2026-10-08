import type { Command } from "../Command.js";

export type RefundPaymentCommand = Command<"RefundPayment"> & {
  readonly paymentId: string;
  readonly amountMinor: number;
};

export function refundPaymentCommand(
  paymentId: string,
  amountMinor: number,
): RefundPaymentCommand {
  return { type: "RefundPayment", paymentId, amountMinor };
}