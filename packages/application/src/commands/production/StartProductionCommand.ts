import type { Command } from "../Command.js";

export type StartProductionCommand = Command<"StartProduction"> & {
  readonly productionId: string;
};

export function startProductionCommand(
  productionId: string,
): StartProductionCommand {
  return { type: "StartProduction", productionId };
}
