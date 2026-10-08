import type { Command } from "../Command.js";

export type CompletePaymentCommand = Command<"CompletePayment"> & {
  readonly paymentId: string;
};

export function completePaymentCommand(paymentId: string): CompletePaymentCommand {
  return { type: "CompletePayment", paymentId, type: "CompletePayment" };
}