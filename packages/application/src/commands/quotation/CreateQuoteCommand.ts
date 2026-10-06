import type { OpportunityId } from "@creative-lab/crm";
import type { Command } from "../Command.js";

export type CreateQuoteCommand = Command<"CreateQuote"> & {
  readonly customerId: string;
  readonly opportunityId?: OpportunityId | null;
  readonly currency?: string;
  readonly quoteNumber?: string;
  readonly validUntil?: Date | null;
};

export function createQuoteCommand(
  input: Omit<CreateQuoteCommand, "type">,
): CreateQuoteCommand {
  return { type: "CreateQuote", ...input } as CreateQuoteCommand;
}
