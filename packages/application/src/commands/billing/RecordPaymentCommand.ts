import type { PaymentMethod } from "@creative-lab/billing";
import type { Command } from "../Command.js";

export type RecordPaymentCommand = Command<"RecordPayment"> & {
  readonly invoiceId: string;
  readonly reference: string;
  readonly amountMinor: number;
  readonly paymentDate?: Date;
  readonly method?: PaymentMethod;
  readonly completeImmediately?: boolean;
};

export function recordPaymentCommand(
  input: Omit<RecordPaymentCommand, "type">,
): RecordPaymentCommand {
  return { type: "RecordPayment", ...input };
}