import type { Command } from "../Command.js";

export type IssueInvoiceCommand = Command<"IssueInvoice"> & {
  readonly invoiceId: string;
};

export function issueInvoiceCommand(invoiceId: string): IssueInvoiceCommand {
  return { type: "IssueInvoice", invoiceId };
}
