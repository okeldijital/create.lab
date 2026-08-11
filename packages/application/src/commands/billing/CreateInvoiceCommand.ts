import type { Command } from "../Command.js";

export type CreateInvoiceCommand = Command<"CreateInvoice"> & {
  readonly customerId: string;
  readonly projectId?: string;
  readonly currency?: string;
  readonly lines: ReadonlyArray<{
    description: string;
    quantity: number;
    unitAmountMinor: number;
  }>;
  readonly invoiceNumber?: string;
};

export function createInvoiceCommand(
  input: Omit<CreateInvoiceCommand, "type">,
): CreateInvoiceCommand {
  return { type: "CreateInvoice", ...input } as CreateInvoiceCommand;
}
