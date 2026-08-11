import type { Command } from "../Command.js";

export type CreateQuoteCommand = Command<"CreateQuote"> & {
  readonly customerId: string;
  readonly title: string;
  readonly currency?: string;
  readonly quoteNumber?: string;
};

export function createQuoteCommand(
  input: Omit<CreateQuoteCommand, "type">,
): CreateQuoteCommand {
  return { type: "CreateQuote", ...input } as CreateQuoteCommand;
}
