import type { Command } from "../Command.js";

export type IssueQuoteCommand = Command<"IssueQuote"> & {
  readonly quoteId: string;
};

export function issueQuoteCommand(quoteId: string): IssueQuoteCommand {
  return { type: "IssueQuote", quoteId };
}
