import type { Command } from "../Command.js";

export type CreatePortfolioCommand = Command<"CreatePortfolio"> & {
  readonly name: string;
  readonly portfolioNumber?: string;
  readonly startDate: string;
  readonly targetEndDate?: string;
  readonly description?: string | null;
};

export function createPortfolioCommand(
  input: Omit<CreatePortfolioCommand, "type">,
): CreatePortfolioCommand {
  return { type: "CreatePortfolio", ...input } as CreatePortfolioCommand;
}
